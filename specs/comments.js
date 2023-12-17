'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');


describe('Comments', () => {
    describe('Create', () => {
        let addedId;

        it('should add a new comment', () => {
            return chakram.post(api.url('comments'), {
                title: 'title',
                body: 'body',
                postId: 1
            }).then(response => {
                expect(response.response.statusCode).to.match(/^20/);
                expect(response.body.data.id).to.be.defined;

                addedId = response.body.data.id;

                const comment = chakram.get(api.url('comments/' + addedId));
                expect(comment).to.have.status(200);
                expect(comment).to.have.json('data.id', addedId);
                expect(comment).to.have.json('data.title', 'title');
                expect(comment).to.have.json('data.body', 'body');
                expect(comment).to.have.json('data.postId', 1);
                return chakram.wait();
            });
        });

        after(() => {
            if (addedId) {
                return chakram.delete(api.url('comments/' + addedId));
            }
        });
    });

    describe('Read', () => {
        it('should have comments', () => {
            const response = chakram.get(api.url('comments'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });
    });

    it('should return a comment by ID', () => {
        const expectedComment = data.comments[0];

        const response = chakram.get(api.url('comments/' + expectedComment.id));
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', comment => {
            expect(comment).to.be.defined;
            expect(comment.id).to.equal(expectedComment.id);
            expect(comment.title).to.equal(expectedComment.title);
            expect(comment.body).to.equal(expectedComment.body);
        });
        return chakram.wait();
    });

    it('should not return post for invalid ID', () => {
        const response = chakram.get(api.url('comments/no-id-like-this'));
        return expect(response).to.have.status(404);
    });

    describe('Update', () => {
        it('should update existing comments with given data', () => {
            const response = chakram.put(api.url('comments/50'), {
                title: 'title',
                body: 'body',
                comment: 111
            });
            expect(response).to.have.status(200);
            return response.then(data => {
                const post = chakram.get(api.url('comments/50'));
                expect(post).to.have.json('data', data => {
                    expect(data.title).to.equal('title');
                    expect(data.body).to.equal('body');
                    expect(data.comment).to.equal(111);
                });
                return chakram.wait();
            });
        });

        it('should throw error if the post does not exist', () => {
            const response = chakram.put(api.url('posts/111'), {
                title: 'title',
                body: 'body',
                userId: 111
            });
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe('Delete', () => {
        it('should delete post by ID', () => {
            const response = chakram.delete(api.url('posts/50'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const post = chakram.get(api.url('posts/50'));
                expect(post).to.have.status(404);
                return chakram.wait();
            });
        });

        it('should throw error if the post does not exist', () => {
            const response = chakram.delete(api.url('posts/111'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });
});
