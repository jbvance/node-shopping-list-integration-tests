const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

// this lets us use *expect* style syntax in our tests
// so we can do things like `expect(1 + 1).to.equal(2);`
// http://chaijs.com/api/bdd/
const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Recipes', function() {
    before(function() {
        return runServer();
    })

    after(function (){
        return closeServer();
    })

    it ('should return recipes on GET', function() {
        return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a("array");
            expect(res.body.length).to.be.at.least(1)

            const expectedKeys = ["name", "ingredients"];
            res.body.forEach(function(item) {
                expect(item).to.be.a("Object");
                expect(item).to.include.keys(expectedKeys);
            });            
        })
    })
});