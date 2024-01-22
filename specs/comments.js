'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const { Test } = require('mocha');
const testData = require('./utils/testData.json');


describe('Comments', () => {
    describe('Create', () => {
        testData.forEach((testCase) => {
            let addedId;

            it('should add a new comment', () => {
                return chakram.post(api.url('comments'), {
                    title: testCase.title,
                    body: testCase.body,
                    postId: testCase.postId
                }).then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const comment = chakram.get(api.url('comments/' + addedId));
                    expect(comment).to.have.status(200);
                    expect(comment).to.have.json('data.id', addedId);
                    expect(comment).to.have.json('data.title', testCase.title);
                    expect(comment).to.have.json('data.body', testCase.body);
                    expect(comment).to.have.json('data.postId', testCase.postId);
                    return chakram.wait();
                });
            });

            after(() => {
                if (addedId) {
                    return chakram.delete(api.url('comments/' + addedId));
                }
            });
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
        testData.forEach((testCase) => {
            it('should update existing comments with given data', () => {
                const response = chakram.put(api.url(`comments/${testCase.commentId}`), {
                    title: testCase.title,
                    body: testCase.body,
                    comment: 111
                });
                expect(response).to.have.status(200);
                return response.then(data => {
                    const post = chakram.get(api.url(`comments/${testCase.commentId}`));
                    expect(post).to.have.status(200);
                    expect(post).to.have.json('data', updatedData => {
                        expect(updatedData.title).to.equal(testCase.title);
                        expect(updatedData.body).to.equal(testCase.body);
                        expect(updatedData.comment).to.equal(111);
                    });
                    return chakram.wait();
                });
            });

            it('should throw error if the post does not exist', () => {
                const response = chakram.put(api.url(`comments/${testCase.notExistingId}`), {
                    title: testCase.title,
                    body: testCase.body,
                    userId: testCase.userId
                });
                expect(response).to.have.status(404);
                return chakram.wait();
            });
        });
    });


    describe('Delete', () => {
        testData.forEach((testCase) => {
            it('should delete comment by ID', () => {
                const response = chakram.delete(api.url(`comments/${testCase.idToDelete}`));
                expect(response).to.have.status(200);
                return response.then(data => {
                    const comment = chakram.get(api.url(`comments/${testCase.idToDelete}`));
                    expect(comment).to.have.status(404);
                    return chakram.wait();
                });
            });

            it('should throw error if the post does not exist', () => {
                const response = chakram.delete(api.url(`comments/${testCase.notExistingId}`));
                expect(response).to.have.status(404);
                return chakram.wait();
            });
        });
    });
});