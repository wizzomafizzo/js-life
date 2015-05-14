/*
 js-life

 The universe of the Game of Life is an infinite two-dimensional orthogonal
 grid of square cells, each of which is in one of two possible states, alive
 or dead. Every cell interacts with its eight neighbours, which are the
 cells that are horizontally, vertically, or diagonally adjacent. At each
 step in time, the following transitions occur:

 1. Any live cell with fewer than two live neighbours dies, as if caused
    by under-population.
 2. Any live cell with two or three live neighbours lives on to the next
    generation.
 3. Any live cell with more than three live neighbours dies, as if by
    overcrowding.
 4. Any dead cell with exactly three live neighbours becomes a live
    cell, as if by reproduction.

 The initial pattern constitutes the seed of the system. The first
 generation is created by applying the above rules simultaneously to every
 cell in the seed-births and deaths occur simultaneously, and the discrete
 moment at which this happens is sometimes called a tick (in other words,
 each generation is a pure function of the preceding one). The rules
 continue to be applied repeatedly to create further generations.
 */

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
};

function fill_array(array, val) {
	for (var i = 0; i < array.length; i++) {
		array[i] = val;
	}
	return array;
}

function mouse_pos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
};

var LifeGrid = function(width, height) {
	this.width = width;
	this.height = height;
	this.grid = fill_array(new Array(width * height), false);
	this.generation = 1;
};

LifeGrid.prototype.index_at = function(x, y) {
	if (y < 0) {
		y = this.height - 1;
	} else if (y >= this.height) {
		y = 0;
	}

	if (x < 0) {
		x = this.width - 1;
	} else if (x >= this.width) {
		x = 0;
	}

	return (y * this.width) + x;
};

LifeGrid.prototype.get = function(x, y) {
	var index = this.index_at(x, y);
	return this.grid[index];
};

LifeGrid.prototype.set = function(x, y, val) {
	var index = this.index_at(x, y);
	this.grid[index] = val;
	return this;
};

LifeGrid.prototype.clear = function() {
	this.grid = fill_array(this.grid, false);
	this.generation = 1;
	return this;
};

LifeGrid.prototype.heal = function(x, y) {
	this.set(x, y, true);
	return this;
};

LifeGrid.prototype.kill = function(x, y) {
	this.set(x, y, false);
	return this;
};

LifeGrid.prototype.toggle = function(x, y) {
	this.set(x, y, !(this.get(x, y)));
	return this;
};

LifeGrid.prototype.neighbours = function(x, y) {
	var to_check = [[-1, -1], [0,  -1], [1,  -1],
					[-1,  0],           [1,   0],
					[-1,  1], [0,   1], [1,   1]],
		count = 0,
		i = 0;

	for (i = 0; i < to_check.length; i++) {
		if (this.get((x + to_check[i][0]),
					 (y + to_check[i][1]))) {
			count += 1;
		}
	}

	return count;
};

LifeGrid.prototype.step = function() {
	var snapshot = this.grid.slice(),
		updated = this.grid,
		cell = null,
		neighbours = null,
		x = 0,
		y = 0;

	for (y = 0; y < this.height; y++) {
		for (x = 0; x < this.width; x++) {
			this.grid = snapshot;
			cell = this.get(x, y);
			neighbours = this.neighbours(x, y);
			this.grid = updated;

			if (cell) {
				if (neighbours < 2 || neighbours > 3) {
					this.kill(x, y);
				}
			} else {
				if (neighbours === 3) {
					this.heal(x, y);
				}
			}
		}
	}

	this.generation += 1;

	return this;
};

var Life = function(width, height, cell_size) {
	var canvas = document.getElementById("life"),
		context = canvas.getContext("2d"),
		generation = document.getElementById("generation"),
		pause_button = document.getElementById("pause"),
		paint_button = document.getElementById("paint"),
		grid_width = Math.floor(width / cell_size),
		grid_height = Math.floor(height / cell_size),
		grid = new LifeGrid(grid_width, grid_height),
		speed = 3,
		interval = 0,
		paused = false,
		paint = false;

	canvas.width = width;
	canvas.height = height;

	var draw_glider = function(x, y) {
		grid.heal(x+1, y+0);
		grid.heal(x+2, y+1);
		grid.heal(x+0, y+2);
		grid.heal(x+1, y+2);
		grid.heal(x+2, y+2);
	};

	var draw_grid = function() {
		var x = 0,
			y = 0;

		context.fillStyle = "#DDDDDD";

		for (x = 1; x < grid_width; x++) {
			context.fillRect(x * cell_size, 0, 1, height);
		}

		for (y = 1; y < grid_height; y++) {
			context.fillRect(0, y * cell_size, width, 1);
		}
	};

	var draw_cells = function() {
		var x = 0,
			y = 0;

		context.fillStyle = "#000000";

		for (y = 0; y < grid_height; y++) {
			for (x = 0; x < grid_width; x++) {
				if (grid.get(x, y)) {
					context.fillRect(x * cell_size, y * cell_size,
									 cell_size, cell_size);
				}
			}
		}
	};

	var cell_at_mouse = function(event) {
		var pos = mouse_pos(canvas, event),
			x = Math.floor((pos.x - 2) / cell_size),
			y = Math.floor((pos.y - 2) / cell_size);
		return [x, y];
	};

	var update = function() {
		if (interval > 0) {
			interval -= 1;
		} else {
			if (!paused) {
				grid.step();
				generation.innerHTML = grid.generation.toString();
			}

			context.fillStyle = "#FFFFFF";
			context.fillRect(0, 0, width, height);

			draw_grid();
			draw_cells();

			interval = speed;
		}

		window.requestAnimationFrame(update);
	};

	var toggle_pause = function() {
		paused = !paused;
		if (paused) {
			pause_button.innerHTML = "Play";
		} else {
			pause_button.innerHTML = "Pause";
		}
	};

	var toggle_paint = function() {
		paint = !paint;
		if (paint) {
			paint_button.innerHTML = "Paint Off";
		} else {
			paint_button.innerHTML = "Paint On";
		}
	};

	var reset = function() {
		grid.clear();
	};

	var slower = function() {
		speed++;
	};

	var faster = function() {
		var new_speed = speed - 1;
		if (new_speed >= 0) {
			speed = new_speed;
		}
	};

	var setup = function() {
		canvas.addEventListener("click", function(event) {
			grid.toggle.apply(grid, cell_at_mouse(event));
		});
		canvas.addEventListener("mousemove", function(event) {
			if (paint) {
				grid.heal.apply(grid, cell_at_mouse(event));
			}
		});
	};

	var start = function() {
		setup();
		draw_glider(0, 0);
		window.requestAnimationFrame(update);
	};

	return {
		draw_glider: draw_glider,
		setup: setup,
		update: update,
		toggle_pause: toggle_pause,
		toggle_paint: toggle_paint,
		reset: reset,
		slower: slower,
		faster: faster,
		start: start
	};
};
