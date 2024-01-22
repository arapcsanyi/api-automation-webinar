'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');
const testData = require('./utils/testData.json');


describe('Users', () => {
    describe('Create', () => {
        testData.forEach((testCase) => {
            let addedId;

            it('should add a new user', () => {
                return chakram.post(api.url('users'), testCase.user).then(response => {
                    expect(response.response.statusCode).to.match(/^20/);
                    expect(response.body.data.id).to.be.defined;

                    addedId = response.body.data.id;

                    const user = chakram.get(api.url('users/' + addedId));
                    expect(user).to.have.status(200);
                    expect(user).to.have.json('data.id', addedId);
                    expect(user).to.have.json('data.name', testCase.user.name);
                    expect(user).to.have.json('data.username', testCase.user.username);
                    expect(user).to.have.json('data.email', testCase.user.email);
                    expect(user).to.have.json('data.address.street', testCase.user.address.street);
                    expect(user).to.have.json('data.address.suite', testCase.user.address.suite);
                    expect(user).to.have.json('data.address.city', testCase.user.address.city);
                    expect(user).to.have.json('data.address.zipcode', testCase.user.address.zipcode);
                    expect(user).to.have.json('data.address.geo.lat', testCase.user.address.geo.lat);
                    expect(user).to.have.json('data.address.geo.lng', testCase.user.address.geo.lng);
                    expect(user).to.have.json('data.phone', testCase.user.phone);
                    expect(user).to.have.json('data.website', testCase.user.website);
                    expect(user).to.have.json('data.company.name', testCase.user.company.name);
                    expect(user).to.have.json('data.company.catchPhrase', testCase.user.company.catchPhrase);
                    expect(user).to.have.json('data.company.bs', testCase.user.company.bs);
                    return chakram.wait();
                });
            });

            after(() => {
                if (addedId) {
                    return chakram.delete(api.url('users/' + addedId));
                }
            });
        });
    });
    describe('Read', () => {
        it('should have users', () => {
            const response = chakram.get(api.url('users'));
            expect(response).to.have.status(200);
            expect(response).to.have.json('data', data => {
                expect(data).to.be.instanceof(Array);
                expect(data.length).to.be.greaterThan(0);
            });
            return chakram.wait();
        });
    });

    it('should return a user by ID', () => {
        const expectedUsers = data.users[0];

        const response = chakram.get(api.url('users/' + expectedUsers.id));
        expect(response).to.have.status(200);
        expect(response).to.have.json('data', user => {
            expect(user).to.be.defined;
            expect(user.id).to.equal(expectedUsers.id);
            expect(user.name).to.equal(expectedUsers.name);
            expect(user.username).to.equal(expectedUsers.username);
            expect(user.email).to.equal(expectedUsers.email);
            expect(user.address.street).to.equal(expectedUsers.address.street);
            expect(user.address.suite).to.equal(expectedUsers.address.suite);
            expect(user.address.city).to.equal(expectedUsers.address.city);
            expect(user.address.zipcode).to.equal(expectedUsers.address.zipcode);
            expect(user.address.geo.lat).to.equal(expectedUsers.address.geo.lat);
            expect(user.address.geo.lng).to.equal(expectedUsers.address.geo.lng);
            expect(user.phone).to.equal(expectedUsers.phone);
            expect(user.website).to.equal(expectedUsers.website);
            expect(user.company.name).to.equal(expectedUsers.company.name);
            expect(user.company.catchPhrase).to.equal(expectedUsers.company.catchPhrase);
            expect(user.company.bs).to.equal(expectedUsers.company.bs);
        });
        return chakram.wait();
    });

    it('should not return user for invalid ID', () => {
        const response = chakram.get(api.url('users/no-id-like-this'));
        return expect(response).to.have.status(404);
    });

    describe('Update', () => {
        it('should update existing user with given data', () => {
            testData.forEach((testCase) => {
                const response = chakram.put(api.url('users/' + testCase.userId), testCase.user);
                return response.then(data => {
                    const post = chakram.get(api.url('users/' + testCase.userId));
                    expect(post).to.have.status(200);
                    expect(post).to.have.json('data', updatedData => {
                        expect(updatedData.name).to.equal(testCase.user.name);
                        expect(updatedData.username).to.equal(testCase.user.username);
                    });
                    return chakram.wait();
                });
            });

            it('should throw error if the User does not exist', () => {
                const response = chakram.put(api.url('users/' + testCase.notExistingId), {
                });
                expect(response).to.have.status(404);
                return chakram.wait();
            });
        });
    });

    describe('Delete', () => {
        testData.forEach((testCase) => {
            it('should throw error if the user does not exist', () => {
                const response = chakram.delete(api.url('users/' + testCase.notExistingId));
                expect(response).to.have.status(404);
                return chakram.wait();
            });

            it('should delete user by ID', () => {
                const response = chakram.delete(api.url('users/' + testCase.userId));
                expect(response).to.have.status(200);
                return chakram.wait();
            });
        });
    });
});
