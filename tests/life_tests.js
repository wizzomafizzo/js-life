var A = true, D = false;

function array_equal(array1, array2) {
	var i = 0;

	if (array1.length != array2.length) {
		return false;
	}

	for (i = 0; i < array1.length; i++) {
		if (array1[i] != array2[i]) {
			return false;
		}
	}

	return true;
}

QUnit.test("Core", function(assert) {
	assert.ok(array_equal([1,2,3],[1,2,3]));
	assert.notOk(array_equal([1,2,3],[1,2]));
	assert.notOk(array_equal([1,2,3],[1,2,1]));
	assert.ok(array_equal(fill_array([false,false,false],true),
						  [true,true,true]));
});

QUnit.test("Grid", function(assert) {
	var g = new LifeGrid(3, 3);
	assert.ok(g.width === 3);
	assert.ok(g.height === 3);
	assert.ok(g.grid.length === 9);
	assert.ok(array_equal(g.grid,[D,D,D,
								  D,D,D,
								  D,D,D]));
	assert.ok(g.index_at(0,0) === 0);
	assert.ok(g.index_at(1,1) === 4);
	assert.ok(g.index_at(2,2) === 8);
	assert.ok(g.index_at(2,1) === 5);
	assert.notOk(g.get(0,0));
	assert.notOk(g.get(2,2));
	assert.notOk(g.get(3,3));
	assert.ok(g.set(0,0,A).get(0,0));
	assert.ok(g.set(1,1,A).get(1,1));
	assert.ok(g.set(2,2,A).get(2,2));
	assert.notOk(g.set(1,0,A).set(1,0,D).get(1,0));
	assert.ok(array_equal(g.clear().grid,[D,D,D,
										  D,D,D,
										  D,D,D]));
	assert.ok(g.heal(0,0).get(0,0));
	assert.ok(g.heal(1,1).get(1,1));
	assert.ok(g.heal(2,2).get(2,2));
	assert.notOk(g.kill(0,0).get(0,0));
	assert.notOk(g.kill(1,1).get(1,1));
	assert.notOk(g.kill(2,2).get(2,2));
	assert.ok(g.toggle(0,0).get(0,0));
	assert.ok(g.toggle(1,1).get(1,1));
	assert.ok(g.toggle(2,2).get(2,2));
	assert.ok(g.neighbours(0,0) === 2);
	assert.ok(g.neighbours(1,1) === 2);
	assert.ok(g.neighbours(2,2) === 2);

	g = new LifeGrid(4, 4);

	g.grid = [D,D,D,D,
			  D,A,A,D,
			  D,A,A,D,
			  D,D,D,D];
	assert.ok(array_equal(g.step().grid,
						  [D,D,D,D,
						   D,A,A,D,
						   D,A,A,D,
						   D,D,D,D]));

	g.grid = [D,A,D,D,
			  D,A,D,D,
			  D,A,D,D,
			  D,D,D,D];
	assert.ok(array_equal(g.step().grid,
						 [D,D,D,D,
						  A,A,A,D,
						  D,D,D,D,
						  D,D,D,D]));
});
