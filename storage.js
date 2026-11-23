'use strict';

// Reading and writing the task list. No DOM access in this file, so the
// tests can load it in Node (see test/storage.test.js).

// Namespaced because every project under aaronkuy.github.io shares one
// localStorage.
const STORAGE_KEY = 'to-do-list:todos';
// Key used before the namespace was added. Read once, then removed.
const LEGACY_STORAGE_KEY = 'todos';

// A function declaration on purpose: script.js loads the list while the
// scripts are still being evaluated, and declarations are hoisted.
function isTodo(value) {
    return (
        value !== null &&
        typeof value === 'object' &&
        typeof value.text === 'string' &&
        typeof value.completed === 'boolean'
    );
}

/**
 * Turns a stored string into a list of tasks. Entries that are not tasks
 * are dropped. Throws if the string is not a JSON array.
 */
function parseTodos(json) {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
        throw new TypeError('Stored tasks are not an array.');
    }
    return parsed
        .filter(isTodo)
        .map((todo) => ({ text: todo.text, completed: todo.completed }));
}

/**
 * Writes the tasks to `storage`. Returns false if that fails (storage
 * blocked or full), so the caller can decide what to do.
 */
function saveTodos(storage, todos) {
    const plain = todos.map((todo) => ({
        text: todo.text,
        completed: todo.completed,
    }));
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(plain));
        return true;
    } catch (error) {
        console.warn('To-do list: tasks could not be saved.', error);
        return false;
    }
}

/**
 * Reads the tasks from `storage`. Returns [] if nothing is stored or the
 * data is unreadable. Tasks saved under the old key are carried over once.
 */
function loadTodos(storage) {
    try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored !== null) {
            return parseTodos(stored);
        }

        const legacy = storage.getItem(LEGACY_STORAGE_KEY);
        if (legacy === null) {
            return [];
        }
        const todos = parseTodos(legacy);
        // Remove the old key only after the copy is written, so a failed
        // write cannot lose the list.
        if (saveTodos(storage, todos)) {
            storage.removeItem(LEGACY_STORAGE_KEY);
        }
        return todos;
    } catch (error) {
        console.warn('To-do list: stored tasks could not be read.', error);
        return [];
    }
}

// Node only (tests). In the browser this file is a classic script and the
// functions above are globals.
if (typeof module !== 'undefined') {
    module.exports = {
        STORAGE_KEY,
        LEGACY_STORAGE_KEY,
        isTodo,
        parseTodos,
        saveTodos,
        loadTodos,
    };
}
