'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const testData = require('./utils/testData.json');

describe('Albums', () => {
    describe('Create', () => {
        testData.forEach((testCase) => {
            let addedId;

            it('should add a new album', () => {
                return chakram.post(api.url('albums'), {
                    userId: testCase.userId,
                    title: testCase.title,
                }).then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const album = chakram.get(api.url('albums/' + addedId));
                    expect(album).to.have.status(200);
                    expect(album).to.have.json('data.id', addedId);
                    expect(album).to.have.json('data.userId', testCase.userId);
                    expect(album).to.have.json('data.title', testCase.title);
                    return chakram.wait();
                });
            });

            after(() => {
                if (addedId) {
                    return chakram.delete(api.url('albums/' + addedId));
                }
            });
        });
    });
});

describe('Read', () => {
    it('should have albums', () => {
        const response = chakram.get(api.url('albums'));
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', data => {
            expect(data).to.be.instanceof(Array);
            expect(data.length).to.be.greaterThan(0);
        });
        return chakram.wait();
    });
});

it('should return a album by ID', () => {
    const expectedAlbum = data.albums[0];

    const response = chakram.get(api.url('albums/' + expectedAlbum.id));
    expect(response).to.have.status(200);
    expect(response).to.have.json('data', album => {
        expect(album).to.be.defined;
        expect(album.id).to.equal(expectedAlbum.id);
        expect(album.userId).to.equal(expectedAlbum.userId);
        expect(album.title).to.equal(expectedAlbum.title);

    });
    return chakram.wait();
});

it('should not return album for invalid ID', () => {
    const response = chakram.get(api.url('albums/no-id-like-this'));
    return expect(response).to.have.status(404);
});

describe('Update', () => {
    testData.forEach((testCase) => {
        it(`should update existing albums with given data from json`, () => {
            const response = chakram.put(api.url(`albums/${testCase.id}`), {
                id: testCase.id,
                userId: testCase.userId,
                title: testCase.title,
            });

            expect(response).to.have.status(200);

            return response.then(() => {
                const getResponse = chakram.get(api.url(`albums/${testCase.id}`));

                expect(getResponse).to.have.status(200);
                expect(getResponse).to.have.json('data', (data) => {
                    expect(data.id).to.equal(testCase.id);
                    expect(data.userId).to.equal(testCase.userId);
                    expect(data.title).to.equal(testCase.title);
                });

                return chakram.wait();
            });
        });

        it('should throw error if the album does not exist', () => {
            const response = chakram.put(api.url(`albums/${testCase.notExistingId}`), {
                id: testCase.notExistingId,
                userId: testCase.userId,
                title: testCase.title
            });

            expect(response).to.have.status(404);

            return chakram.wait();
        });
    });

    describe('Delete', () => {
        testData.forEach((testCase) => {
            it(`should delete album by ID: ${testCase.idToDelete}`, () => {
                const response = chakram.delete(api.url(`albums/${testCase.idToDelete}`));
                expect(response).to.have.status(200);

                return response.then(() => {
                    const todo = chakram.get(api.url(`albums/${testCase.idToDelete}`));
                    expect(todo).to.have.status(404);

                    return chakram.wait();
                });
            });
        });
    });
});
