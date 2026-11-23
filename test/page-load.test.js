'use strict';

// Runs storage.js and then script.js the way the browser does (two classic
// scripts in one global scope) against a small stand-in for the DOM. The
// storage tests call loadTodos() directly; this test checks the page itself:
// opening it must show the stored tasks and must not overwrite them.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const STORAGE_SOURCE = fs.readFileSync(path.join(ROOT, 'storage.js'), 'utf8');
const SCRIPT_SOURCE = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');

// Just enough of an element for what script.js touches while loading.
class FakeElement {
    constructor(tagName, className = '') {
        this.tagName = tagName;
        this.className = className;
        this.children = [];
        this.dataset = {};
        this.attributes = {};
        this.listeners = {};
        this.textContent = '';
    }

    append(...nodes) {
        this.children.push(...nodes);
    }

    replaceChildren(...nodes) {
        this.children = nodes;
    }

    addEventListener(type, listener) {
        this.listeners[type] = listener;
    }

    setAttribute(name, value) {
        this.attributes[name] = String(value);
    }

    get firstElementChild() {
        return this.children[0];
    }

    cloneNode() {
        const copy = new FakeElement(this.tagName, this.className);
        copy.children = this.children.map((child) => child.cloneNode());
        return copy;
    }

    *descendants() {
        for (const child of this.children) {
            yield child;
            yield* child.descendants();
        }
    }

    // Supports the three selector forms script.js uses: tag, .class, tag list.
    querySelectorAll(selector) {
        return [...this.descendants()].filter((element) =>
            selector.startsWith('.')
                ? element.className.split(' ').includes(selector.slice(1))
                : element.tagName === selector,
        );
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] ?? null;
    }
}

// Mirrors the <template id="todo-template"> in index.html.
function todoTemplate() {
    const li = new FakeElement('li', 'to-do');
    li.append(
        new FakeElement('input'),
        new FakeElement('label', 'custom-checkbox'),
        new FakeElement('label', 'to-do-text'),
        new FakeElement('button', 'delete-btn'),
    );
    const template = new FakeElement('template');
    template.content = { firstElementChild: li };
    return template;
}

function fakeStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
    };
}

function openPage(storage) {
    const elements = {
        'write-input': new FakeElement('input'),
        list: new FakeElement('ul'),
        'todo-template': todoTemplate(),
    };
    const form = new FakeElement('form');
    const context = {
        console: { warn() {} },
        document: {
            querySelector: (selector) => (selector === 'form' ? form : null),
            getElementById: (id) => elements[id] ?? null,
        },
    };
    context.window = { localStorage: storage };
    vm.createContext(context);
    vm.runInContext(STORAGE_SOURCE, context, { filename: 'storage.js' });
    vm.runInContext(SCRIPT_SOURCE, context, { filename: 'script.js' });

    const rendered = elements.list.children.map((li) => ({
        text: li.querySelector('.to-do-text').textContent,
        completed: li.querySelector('input').checked,
    }));
    return { rendered, form };
}

const TASKS = [
    { text: 'Write the report', completed: true },
    { text: 'Fix <header>', completed: false },
];

test('opening the page shows the stored tasks and leaves the storage as it was', () => {
    const stored = JSON.stringify(TASKS);
    const storage = fakeStorage({ 'to-do-list:todos': stored });

    for (let reload = 0; reload < 3; reload += 1) {
        const { rendered, form } = openPage(storage);
        assert.deepEqual(rendered, TASKS);
        assert.equal(storage.getItem('to-do-list:todos'), stored);
        assert.equal(typeof form.listeners.submit, 'function');
    }
});

test('tasks under the old key are shown on the first visit and kept after it', () => {
    const storage = fakeStorage({ todos: JSON.stringify(TASKS) });

    assert.deepEqual(openPage(storage).rendered, TASKS);
    assert.equal(storage.getItem('to-do-list:todos'), JSON.stringify(TASKS));
    assert.equal(storage.getItem('todos'), null);
    assert.deepEqual(openPage(storage).rendered, TASKS);
});

test('unreadable data does not stop the page: the form handler is registered', () => {
    const storage = fakeStorage({ 'to-do-list:todos': '{' });
    const { rendered, form } = openPage(storage);
    assert.deepEqual(rendered, []);
    assert.equal(typeof form.listeners.submit, 'function');
    // Nothing is written while loading, so the data is still there to inspect.
    assert.equal(storage.getItem('to-do-list:todos'), '{');
});
