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
    });

    it('should add a recipe on POST', function() {
        const newItem = { name: 'Guacamole', ingredients: [ 'avocado', 'tomato', 'cilantro', 'jalapeno', 'salt', 'garlic'  ]};
        return chai.request(app)
            .post('/recipes')
            .send(newItem)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object')
                expect(res.body).to.include.keys('id', 'name', 'ingredients');
                expect(res.body.id).to.not.equal(null);
                expect(res.body).to.deep.equal({ ...newItem, id: res.body.id});
            })
    });

    it('should NOT add a recipe on POST if name is missing', function() {
        const newItem = {ingredients: [ 'avocado', 'tomato', 'cilantro', 'jalapeno', 'salt', 'garlic'  ]};
        return chai.request(app)
            .post('/recipes')
            .send(newItem)
            .then(function(res) {
                expect(res).to.have.status(400);                
            })
    });

    it('should update a recipe on PUT', function() {
       const updateData = {
           name: 'Test Recipe Update',
           ingredients: ['update ingredient 1', 'update ingredient 2']
       };
       return chai.request(app)
        .get('/recipes')
        .then(function(res) {           
            updateData.id = res.body[0].id;
            return chai.request(app)
                .put(`/recipes/${updateData.id}`)
                .send(updateData)
        })
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body).to.deep.equal(updateData);
        })
    });

    it('should delete an item on DELETE', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                const deleteId = res.body[0].id;
                return chai.request(app)
                    .delete(`/recipes/${deleteId}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            })
    })

});