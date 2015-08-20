JSHINT = node_modules/.bin/jshint
JSCS = node_modules/.bin/jscs
MOCHA = node_modules/.bin/mocha
.PHONY: test ocha jscs jshint

test:
	make jscs && make jshint && make mocha

mocha:
	$(MOCHA)

jscs:
	$(JSCS) .

jshint:
	$(JSHINT) .
