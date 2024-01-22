'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const testData = require('./utils/testData.json');

describe('TODOs', () => {
    describe('Create', () => {
        testData.forEach((testCase) => {
            let addedId;

            it('should add a new TODO', () => {
                return chakram.post(api.url('todos'), {
                    userId: testCase.userId,
                    title: testCase.title,
                    completed: testCase.completed
                }).then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const todo = chakram.get(api.url(`todos/${addedId}`));
                    expect(todo).to.have.status(200);
                    expect(todo).to.have.json('data.id', addedId);
                    expect(todo).to.have.json('data.userId', testCase.userId);
                    expect(todo).to.have.json('data.title', testCase.title);
                    expect(todo).to.have.json('data.completed', testCase.completed);

                    return chakram.wait();
                });
            });

            after(() => {
                if (addedId) {
                    return chakram.delete(api.url(`todos/` + addedId));
                }
            });
        });
    });

    describe('Read', () => {
        it('should have todos', () => {
            const response = chakram.get(api.url('todos'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', (todos) => {
                expect(todos).to.be.an('array').that.is.not.empty;
            });
            return chakram.wait();
        });
    });

    it('should return a TODO by ID', () => {
        const expectedTodo = data.todos[0];

        const response = chakram.get(api.url(`todos/${expectedTodo.id}`));
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', (todo) => {
            expect(todo).to.be.defined;
            expect(todo.id).to.equal(expectedTodo.id);
            expect(todo.userId).to.equal(expectedTodo.userId);
            expect(todo.title).to.equal(expectedTodo.title);
            expect(todo.completed).to.equal(expectedTodo.completed);
        });
        return chakram.wait();
    });

    it('should not return TODO for invalid ID', () => {
        const response = chakram.get(api.url('todos/no-id-like-this'));
        return expect(response).to.have.status(404);
    });

    describe('Update', () => {
        testData.forEach((testCase) => {
            it('should update existing TODOs with given data', () => {
                const response = chakram.put(api.url(`todos/${testCase.id}`), {
                    userId: testCase.userId,
                    title: testCase.title,
                    completed: testCase.completed
                });

                expect(response).to.have.status(200);

                return response.then(() => {
                    const updatedTodo = chakram.get(api.url(`todos/${testCase.id}`));
                    expect(updatedTodo).to.have.status(200);
                    expect(updatedTodo).to.have.json('data', (data) => {
                        expect(data.id).to.equal(testCase.id);
                        expect(data.userId).to.equal(testCase.userId);
                        expect(data.title).to.equal(testCase.title);
                        expect(data.completed).to.equal(testCase.completed);
                    });
                    return chakram.wait();
                });
            });

            it('should throw error if the TODO does not exist', () => {
                const response = chakram.put(api.url(`todos/${testCase.notExistingId}`), {
                    userId: testCase.userId,
                    title: testCase.title,
                    completed: testCase.completed
                });

                expect(response).to.have.status(404);

                return chakram.wait();
            });
        });
    });

    describe('Delete', () => {
        testData.forEach((testCase) => {
            it('should delete TODO by ID', () => {
                const response = chakram.delete(api.url(`todos/${testCase.idToDelete}`));
                expect(response).to.have.status(200);

                return response.then(() => {
                    const deletedTodo = chakram.get(api.url(`todos/${testCase.idToDelete}`));
                    expect(deletedTodo).to.have.status(404);
                    return chakram.wait();
                });
            });

            it('should throw error if the TODO does not exist', () => {
                const response = chakram.delete(api.url(`todos/${testCase.notExistingId}`));
                expect(response).to.have.status(404);

                return chakram.wait();
            });
        });
    });
});

