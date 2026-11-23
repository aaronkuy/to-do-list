'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
    isTodo,
    loadTodos,
    saveTodos,
} = require('../storage.js');

// Minimal stand-in for localStorage.
function fakeStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data,
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => data.set(key, String(value)),
        removeItem: (key) => data.delete(key),
    };
}

// loadTodos() and saveTodos() warn on purpose; keep the test output quiet
// and make the warning checkable.
function silenceWarnings(t) {
    return t.mock.method(console, 'warn', () => {});
}

const TASKS = [
    { text: 'Write the report', completed: true },
    { text: 'Buy milk', completed: false },
];

test('isTodo accepts only objects with a string text and a boolean completed', () => {
    assert.equal(isTodo({ text: 'a', completed: false }), true);
    assert.equal(isTodo(null), false);
    assert.equal(isTodo('a'), false);
    assert.equal(isTodo({ text: null, completed: false }), false);
    assert.equal(isTodo({ text: 'a' }), false);
    assert.equal(isTodo({ text: 'a', completed: 'yes' }), false);
});

test('loadTodos returns [] when nothing is stored', () => {
    assert.deepEqual(loadTodos(fakeStorage()), []);
});

test('saved tasks come back unchanged, load after load', () => {
    const storage = fakeStorage();
    assert.equal(saveTodos(storage, TASKS), true);
    // Loading must not alter what is stored.
    assert.deepEqual(loadTodos(storage), TASKS);
    assert.deepEqual(loadTodos(storage), TASKS);
    assert.equal(storage.getItem(STORAGE_KEY), JSON.stringify(TASKS));
});

test('saveTodos stores text and completed only', () => {
    const storage = fakeStorage();
    saveTodos(storage, [{ id: '7', text: 'Buy milk', completed: false }]);
    assert.equal(
        storage.getItem(STORAGE_KEY),
        '[{"text":"Buy milk","completed":false}]',
    );
});

test('unreadable data yields [] and a warning instead of an exception', (t) => {
    const warn = silenceWarnings(t);
    for (const bad of ['{', 'null', '{"a":1}', '"text"', '42']) {
        assert.deepEqual(loadTodos(fakeStorage({ [STORAGE_KEY]: bad })), []);
    }
    assert.equal(warn.mock.callCount(), 5);
});

test('entries that are not tasks are dropped, the rest is kept', () => {
    const stored = JSON.stringify([
        null,
        { text: null, completed: false },
        { text: 'Buy milk', completed: false, extra: 1 },
        'x',
    ]);
    assert.deepEqual(loadTodos(fakeStorage({ [STORAGE_KEY]: stored })), [
        { text: 'Buy milk', completed: false },
    ]);
});

test('tasks under the old key are carried over once', () => {
    const storage = fakeStorage({ [LEGACY_STORAGE_KEY]: JSON.stringify(TASKS) });

    assert.deepEqual(loadTodos(storage), TASKS);
    assert.equal(storage.getItem(STORAGE_KEY), JSON.stringify(TASKS));
    assert.equal(storage.getItem(LEGACY_STORAGE_KEY), null);

    // Once the list has been emptied, an old key must not bring tasks back.
    saveTodos(storage, []);
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(TASKS));
    assert.deepEqual(loadTodos(storage), []);
});

test('an unreadable old key is left alone', (t) => {
    silenceWarnings(t);
    const storage = fakeStorage({ [LEGACY_STORAGE_KEY]: '{' });
    assert.deepEqual(loadTodos(storage), []);
    assert.equal(storage.getItem(LEGACY_STORAGE_KEY), '{');
});

test('the old key survives if the copy cannot be written', (t) => {
    silenceWarnings(t);
    const storage = fakeStorage({ [LEGACY_STORAGE_KEY]: JSON.stringify(TASKS) });
    storage.setItem = () => {
        throw new Error('QuotaExceededError');
    };
    assert.deepEqual(loadTodos(storage), TASKS);
    assert.equal(storage.getItem(LEGACY_STORAGE_KEY), JSON.stringify(TASKS));
});

test('blocked storage: loading yields [], saving reports false', (t) => {
    silenceWarnings(t);
    const blocked = {
        getItem() {
            throw new Error('SecurityError');
        },
        setItem() {
            throw new Error('SecurityError');
        },
    };
    assert.deepEqual(loadTodos(blocked), []);
    assert.equal(saveTodos(blocked, TASKS), false);
    // script.js passes null when window.localStorage itself throws.
    assert.deepEqual(loadTodos(null), []);
    assert.equal(saveTodos(null, TASKS), false);
});
