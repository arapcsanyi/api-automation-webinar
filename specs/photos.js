'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const testData = require('./utils/testData.json');


describe('Photos', () => {
    describe('Create', () => {
        testData.forEach((testCase) => {
            let addedId;

            it('should add a new photo', () => {
                return chakram.post(api.url('photos'), {
                    title: testCase.title,
                    url: testCase.url,
                    thumbnailUrl: testCase.thumbnailUrl,
                }).then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const photo = chakram.get(api.url('photos/' + addedId));
                    expect(photo).to.have.status(200);
                    expect(photo).to.have.json('data.id', addedId);
                    expect(photo).to.have.json('data.title', testCase.title);
                    expect(photo).to.have.json('data.url', testCase.url);
                    expect(photo).to.have.json('data.thumbnailUrl', testCase.thumbnailUrl);
                    return chakram.wait();
                });
            });

            after(() => {
                if (addedId) {
                    return chakram.delete(api.url('photos/' + addedId));
                }
            });
        });
    });

    describe('Read', () => {
        it('should have photos', () => {
            const response = chakram.get(api.url('photos'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });
    });

    it('should return a photo by ID', () => {
        const expectedPhoto = data.photos[0];

        const response = chakram.get(api.url('photos/' + expectedPhoto.id));
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', photo => {
            expect(photo).to.be.defined;
            expect(photo.id).to.equal(expectedPhoto.id);
            expect(photo.title).to.equal(expectedPhoto.title);
            expect(photo.url).to.equal(expectedPhoto.url);
            expect(photo.thumbnailUrl).to.equal(expectedPhoto.thumbnailUrl);
        });
        return chakram.wait();
    });

    it('should not return photo for invalid ID', () => {
        const response = chakram.get(api.url('photos/no-id-like-this'));
        return expect(response).to.have.status(404);
    });

    describe('Update', () => {
        testData.forEach((testCase) => {
            it('should update existing photo with given data', () => {
                const response = chakram.put(api.url(`photos/${testCase.id}`), {
                    title: testCase.title,
                    url: testCase.url,
                    thumbnailUrl: testCase.thumbnailUrl
                });

                expect(response).to.have.status(200);

                return response.then(() => {
                    const post = chakram.get(api.url(`photos/${testCase.id}`));

                    expect(post).to.have.status(200);
                    expect(post).to.have.json('data', updatedData => {
                        expect(updatedData.id).to.equal(testCase.id);
                        expect(updatedData.title).to.equal(testCase.title);
                        expect(updatedData.url).to.equal(testCase.url);
                        expect(updatedData.thumbnailUrl).to.equal(testCase.thumbnailUrl);
                    });

                    return chakram.wait();
                });
            });

            it('should throw error if the photo does not exist', () => {
                const response = chakram.put(api.url(`photos/${testCase.notExistingId}`), {
                    title: testCase.title,
                    url: testCase.url,
                    thumbnailUrl: testCase.thumbnailUrl
                });

                expect(response).to.have.status(404);

                return chakram.wait();
            });
        });
    });


    describe('Delete', () => {
        testData.forEach((testCase) => {
            it('should delete photo by ID', () => {
                const response = chakram.delete(api.url(`photos/${testCase.idToDelete}`));
                expect(response).to.have.status(200);
                return response.then(data => {
                    const photo = chakram.get(api.url(`photos/${testCase.idToDelete}`));
                    expect(photo).to.have.status(404);
                    return chakram.wait();
                });
            });

            it('should throw error if the photo does not exist', () => {
                const response = chakram.delete(api.url(`photos/${testCase.notExistingId}`));
                expect(response).to.have.status(404);
                return chakram.wait();
            });
        });
    });
});

