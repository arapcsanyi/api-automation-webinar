'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const api = require('./utils/api');
const data = require('../server/data.json');


describe('Users', () => {
    describe('Create', () => {
        let addedId;

        it('should add a new user', () => {
            return chakram.post(api.url('users'), {
                name: 'name',
                username: 'username',
                email: 'email',
                address: {
                    street: 'street',
                    suite: 'suite',
                    city: 'city',
                    zipcode: 'zipcode',
                    geo: {
                        lat: 'lat',
                        lng: 'lng'
                    }
                },
                phone: 'phone',
                website: 'website',
                company: {
                    name: 'name',
                    catchPhrase: 'catchPhrase',
                    bs: 'bs'
                }
            }).then(response => {
                expect(response.response.statusCode).to.match(/^20/);
                expect(response.body.data.id).to.be.defined;

                addedId = response.body.data.id;

                const user = chakram.get(api.url('users/' + addedId));
                expect(user).to.have.status(200);
                expect(user).to.have.json('data.id', addedId);
                expect(user).to.have.json('data.name', 'name');
                expect(user).to.have.json('data.username', 'username');
                expect(user).to.have.json('data.email', 'email');
                expect(user).to.have.json('data.address.street', 'street');
                expect(user).to.have.json('data.address.suite', 'suite');
                expect(user).to.have.json('data.address.city', 'city');
                expect(user).to.have.json('data.address.zipcode', 'zipcode');
                expect(user).to.have.json('data.address.geo.lat', 'lat');
                expect(user).to.have.json('data.address.geo.lng', 'lng');
                expect(user).to.have.json('data.phone', 'phone');
                expect(user).to.have.json('data.website', 'website');
                expect(user).to.have.json('data.company.name', 'name');
                expect(user).to.have.json('data.company.catchPhrase', 'catchPhrase');
                expect(user).to.have.json('data.company.bs', 'bs');
                return chakram.wait();
            });
        });

        after(() => {
            if (addedId) {
                return chakram.delete(api.url('users/' + addedId));
            }
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
            const response = chakram.put(api.url('users/3'), {
                id: 3,
                name: 'name',
                username: 'username',
                email: 'email',
                address: {
                    street: 'street',
                    suite: 'suite',
                    city: 'city',
                    zipcode: 'zipcode',
                    geo: {
                        lat: 'lat',
                        lng: 'lng'
                    }
                },
                phone: 'phone',
                website: 'website',
                company: {
                    name: 'name',
                    catchPhrase: 'catchPhrase',
                    bs: 'bs'
                }
            });
            expect(response).to.have.status(200);
            return response.then(data => {
                const post = chakram.get(api.url('users/3'));
                expect(post).to.have.json('data', data => {
                    expect(data.name).to.equal('name');
                    expect(data.username).to.equal('username');
                    expect(data.email).to.equal('email');
                    expect(data.address.street).to.equal('street');
                    expect(data.address.suite).to.equal('suite');
                    expect(data.address.city).to.equal('city');
                    expect(data.address.zipcode).to.equal('zipcode');
                    expect(data.address.geo.lat).to.equal('lat');
                    expect(data.address.geo.lng).to.equal('lng');
                    expect(data.phone).to.equal('phone');
                    expect(data.website).to.equal('website');
                    expect(data.company.name).to.equal('name');
                    expect(data.company.catchPhrase).to.equal('catchPhrase');
                    expect(data.company.bs).to.equal('bs');
                });
                return chakram.wait();
            });
        });

        it('should throw error if the User does not exist', () => {
            const response = chakram.put(api.url('users/111'), {
                id: 111,
                name: 'name',
                username: 'username',
                email: 'email',
                address: {
                    street: 'street',
                    suite: 'suite',
                    city: 'city',
                    zipcode: 'zipcode',
                    geo: {
                        lat: 'lat',
                        lng: 'lng'
                    }
                },
                phone: 'phone',
                website: 'website',
                company: {
                    name: 'name',
                    catchPhrase: 'catchPhrase',
                    bs: 'bs'
                }
            });
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });

    describe('Delete', () => {
        it('should delete User by ID', () => {
            const response = chakram.delete(api.url('users/10'));
            expect(response).to.have.status(200);
            return response.then(data => {
                const user = chakram.get(api.url('users/10'));
                expect(user).to.have.status(404);
                return chakram.wait();
            });
        });

        it('should throw error if the user does not exist', () => {
            const response = chakram.delete(api.url('users/111'));
            expect(response).to.have.status(404);
            return chakram.wait();
        });
    });
});
