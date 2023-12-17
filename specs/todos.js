'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');


describe('TODOs', () => {
    describe('Create', () => {
        let addedId;

        it('should add a new TODO', () => {
            return chakram.post(api.url('todos'), {
                userId: 1,
                title: 'title',
                completed: false
            }).then(response => {
                expect(response.response.statusCode).to.match(/^20/);
                expect(response.body.data.id).to.be.defined;

                addedId = response.body.data.id;

                const todo = chakram.get(api.url('todos/' + addedId));
                expect(todo).to.have.status(200);
                expect(todo).to.have.json('data.id', addedId);
                expect(todo).to.have.json('data.userId', 1);
                expect(todo).to.have.json('data.title', 'title');
                expect(todo).to.have.json('data.completed', false);
                return chakram.wait();
            });
        });

        after(() => {
            if (addedId) {
                return chakram.delete(api.url('todos/' + addedId));
            }
        });
    });

    describe('Read', () => {
        it('should have todos', () => {
            const response = chakram.get(api.url('todos'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });
    });

    it('should return a TODO by ID', () => {
        const expectedTodo = data.todos[0];

        const response = chakram.get(api.url('todos/' + expectedTodo.id));
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', todo => {
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
        it('should update existing todos with given data', () => {
            const response = chakram.put(api.url('todos/3'), {
                id: 3,
                userId: 3,
                title: 'title',
                completed: false
            });
            expect(response).to.have.status(200);
            return response.then(data => {
                const post = chakram.get(api.url('todos/3'));
                expect(post).to.have.json('data', data => {
                    expect(data.id).to.equal(3);
                    expect(data.userId).to.equal(3);
                    expect(data.title).to.equal('title');
                    expect(data.completed).to.equal(false);
                });
                return chakram.wait();
            });
        });

        it('should throw error if the TODO does not exist', () => {
            const response = chakram.put(api.url('todos/666'), {
                id: 666,
                userId: 'userId',
                title: 'title',
                completed: false
            });
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe('Delete', () => {
        it('should delete TODO by ID', () => {
            const response = chakram.delete(api.url('todos/10'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const todo = chakram.get(api.url('todos/10'));
                expect(todo).to.have.status(404);
                return chakram.wait();
            });
        });

        it('should throw error if the todo does not exist', () => {
            const response = chakram.delete(api.url('todos/666'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });
});
