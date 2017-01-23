var entry = require('./entry.js');

describe('three', function () {

    describe('side affects', function () {

        it('clears require cache between specs', function () {
            expect(require('./stateless.js').state).toBe('none');
            expect(entry.bar).toBe('real');
        });

        it('timeout waits for clock to tick', function (done) {
            setTimeout(function () {
                expect(1).toBe(1);
                done();
            }, 1000);
            jasmine.clock().tick(1000);
        });

        it('mocks fetch', function (done) {
            fetch('flowers.jpg')
                .then(function (response) {
                    response.json().then(function (json) {
                        expect(json.outcome).toBe('fetch responded correctly');
                        done();
                    });

                })
                .catch(function (err) {
                    console.log(err);
                    done();
                });

            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                responseText: '{ "outcome": "fetch responded correctly" }'
            });
        });

        it('mocks XHR', function () {
            var result = '';

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (args) {
                if (this.readyState == this.DONE) {
                    result = this.responseText;
                }
            };

            xhr.open("GET", "/some/cool/url", true);
            xhr.send();

            var xhr2 = new XMLHttpRequest();
            xhr2.onreadystatechange = function (args) {
                if (this.readyState == this.DONE) {
                    result = this.responseText;
                }
            };

            xhr2.open("GET", "/some/other/url", true);
            xhr2.send();

            expect(jasmine.Ajax.requests.first().url).toBe('/some/cool/url');
            expect(result).toBe('');

            jasmine.Ajax.requests.filter('/some/other/url')[0].respondWith({
                status: 200,
                responseText: 'OTHER'
            });

            expect(result).toBe('OTHER');
        });

    });

});
