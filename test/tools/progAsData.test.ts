import * as chai from "chai";
import { expect } from "chai";
import { describe, it } from "mocha";
import { expectParseProgram } from "../utils";
import toPad, {
	displayPad,
	fromPad,
	HWHILE_DISPLAY_FORMAT,
	ProgDataType,
	PURE_DISPLAY_FORMAT
} from "../../src/tools/progAsData";

chai.config.truncateThreshold = 0;

describe('To Programs as Data', function () {
	describe('Basic conversion', function () {
		it(`should correctly convert variable values`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					Y := X
				} write Y
			`);

			//The expected PAD result
			let expected: ProgDataType = [0, [
				[':=', 1, ['var', 0]]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`should correctly convert nil`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					Y := nil
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				[':=', 1, ['quote', 'nil']]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`should correctly convert hd`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					Y := hd X
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				[':=', 1, ['hd', ['var', 0]]]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`should correctly convert tl`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					Y := tl X
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				[':=', 1, ['tl', ['var', 0]]]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`should correctly convert if`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					if X {}
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				['if', ['var', 0], [], []]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`should correctly convert if-else`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					if X {} else {}
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				['if', ['var', 0], [], []]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`should correctly convert while`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				prog read X {
					while X { }
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				['while', ['var', 0], []]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});
	});

	describe('Program conversion', function () {
		it(`[Example program from LoC2]`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				p read X {
					Y := nil;
					while X {
						Y := cons hd X Y;
						X := tl X
					}
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				[':=', 1, ['quote','nil']],
				['while', ['var',0], [
					[':=', 1, ['cons', ['hd', ['var', 0]], ['var', 1]]],
					[':=', 0, ['tl', ['var', 0]]]
				]]
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`add.while`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				add read XY {
					X := hd XY;
					Y := tl XY;
					while X {
						Y := cons nil Y;
						X := tl X
					}
				} write Y
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				[':=', 1, ['hd', ['var', 0]]],
				[':=', 2, ['tl', ['var', 0]]],
				['while', ['var', 1], [
					[':=', 2, ['cons', ['quote', 'nil'], ['var', 2]]],
					[':=', 1, ['tl', ['var', 1]]]
				]]
			], 2];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`count.while`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				count read LIST {
					SUM := 0;
					while LIST {
						// Remove the head of the list and assign it to ELEM
						ELEM := hd LIST;
						LIST := tl LIST;
					
						// Add ELEM to SUM
						while ELEM {
							SUM := cons nil SUM;
							ELEM := tl ELEM
						}
					}
				} write SUM
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [
				[':=', 1, ['quote', 'nil']],
				['while', ['var', 0], [
					[':=', 2, ['hd', ['var', 0]]],
					[':=', 0, ['tl', ['var', 0]]],

					['while', ['var', 2], [
						[':=', 1, ['cons', ['quote', 'nil'], ['var', 1]]],
						[':=', 2, ['tl', ['var', 2]]],
					]],
				]],
			], 1];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});

		it(`identity.while`, function () {
			//Create a ProgramManager for the program
			let ast = expectParseProgram(`
				ident read X { } write X
			`);

			//The expected pure AST
			let expected: ProgDataType = [0, [], 0];

			//Expect the program-as-data result
			expect(toPad(ast)).to.deep.equal(expected);
		});
	});
});

describe('From Programs as Data', function () {
	describe('Basic conversion', function () {
		it(`should correctly convert variable values`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['var', 0]]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := A
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`should correctly convert nil`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['quote', 'nil']]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := nil
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`should correctly convert hd`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['hd', ['var', 0]]]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := hd A
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`should correctly convert tl`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['tl', ['var', 0]]]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := tl A
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`should correctly convert if`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				['if', ['var', 0], [], []]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					if A {}
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`should correctly convert if-else`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				['if', ['var', 0], [], []]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					if A {} else {}
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`should correctly convert while`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				['while', ['var', 0], []]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					while A { }
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});
	});

	describe('Program conversion', function () {
		it(`[Example program from LoC2]`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['quote','nil']],
				['while', ['var',0], [
					[':=', 1, ['cons', ['hd', ['var', 0]], ['var', 1]]],
					[':=', 0, ['tl', ['var', 0]]]
				]]
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := nil;
					while A {
						B := cons hd A B;
						A := tl A
					}
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`add.while`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['hd', ['var', 0]]],
				[':=', 2, ['tl', ['var', 0]]],
				['while', ['var', 1], [
					[':=', 2, ['cons', ['quote', 'nil'], ['var', 2]]],
					[':=', 1, ['tl', ['var', 1]]]
				]]
			], 2];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := hd A;
					C := tl A;
					while B {
						C := cons nil C;
						B := tl B
					}
				} write C
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`count.while`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [
				[':=', 1, ['quote', 'nil']],
				['while', ['var', 0], [
					[':=', 2, ['hd', ['var', 0]]],
					[':=', 0, ['tl', ['var', 0]]],

					['while', ['var', 2], [
						[':=', 1, ['cons', ['quote', 'nil'], ['var', 1]]],
						[':=', 2, ['tl', ['var', 2]]],
					]],
				]],
			], 1];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A {
					B := 0;
					while A {
						C := hd A;
						A := tl A;

						while C {
							B := cons nil B;
							C := tl C
						}
					}
				} write B
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});

		it(`identity.while`, function () {
			//prog-as-data input
			let pad: ProgDataType = [0, [], 0];

			//The expected AST to be produced
			let expected = expectParseProgram(`
				prog read A { } write A
			`);

			//Expect the program-as-data result
			expect(fromPad(pad)).to.deep.equal(expected);
		});
	});
});

describe('Display Programs as Data', function () {
	it(`should correctly convert assignment and nil`, function () {
		let pad: ProgDataType = [0, [
			[':=', 1, ['quote', 'nil']]
		], 1];

		expect(displayPad(pad, HWHILE_DISPLAY_FORMAT)).to.deep.equal(``
			+ `[0, [\n`
			+ `    [@:=, 1, [@quote, nil]]\n`
			+ `], 1]\n`
		);
	});

	it(`should correctly convert operations (hd/tl/cons)`, function () {
		let pad: ProgDataType = [0, [
			[':=', 1, ['hd', ['var', 0]]],
			[':=', 2, ['tl', ['var', 0]]],
			[':=', 3, ['cons', ['var', 1], ['var', 2]]],
		], 3];

		expect(displayPad(pad, HWHILE_DISPLAY_FORMAT)).to.deep.equal(``
			+ `[0, [\n`
			+ `    [@:=, 1, [@hd, [@var, 0]]],\n`
			+ `    [@:=, 2, [@tl, [@var, 0]]],\n`
			+ `    [@:=, 3, [@cons, [@var, 1], [@var, 2]]]\n`
			+ `], 3]\n`
		);
	});

	it(`should correctly convert while loops and conditions`, function () {
		let pad: ProgDataType = [0, [
			[':=', 1, ['quote', 'nil']],
			['while', ['var', 0], [
				[':=', 1, ['cons', ['quote', 'nil'], ['var', 1]]],
				['if', ['hd', ['var', 0]], [
					[':=', 0, ['hd', ['var', 0]]]
				], [
					[':=', 0, ['tl', ['var', 0]]]
				]]
			]]
		], 1];

		expect(displayPad(pad, HWHILE_DISPLAY_FORMAT)).to.deep.equal(``
			+ `[0, [\n`
			+ `    [@:=, 1, [@quote, nil]],\n`
			+ `    [@while, [@var, 0], [\n`
			+ `        [@:=, 1, [@cons, [@quote, nil], [@var, 1]]],\n`
			+ `        [@if, [@hd, [@var, 0]], [\n`
			+ `            [@:=, 0, [@hd, [@var, 0]]]\n`
			+ `        ], [\n`
			+ `            [@:=, 0, [@tl, [@var, 0]]]\n`
			+ `        ]]\n`
			+ `    ]]\n`
			+ `], 1]\n`
		);
	});

	it(`[Example program from LoC2]`, function () {
		let pad: ProgDataType = [0, [
			[':=', 1, ['quote','nil']],
			['while', ['var',0], [
				[':=', 1, ['cons', ['hd', ['var', 0]], ['var', 1]]],
				[':=', 0, ['tl', ['var', 0]]]
			]]
		], 1];

		expect(displayPad(pad, HWHILE_DISPLAY_FORMAT)).to.deep.equal(``
			+ `[0, [\n`
			+ `    [@:=, 1, [@quote, nil]],\n`
			+ `    [@while, [@var, 0], [\n`
			+ `        [@:=, 1, [@cons, [@hd, [@var, 0]], [@var, 1]]],\n`
			+ `        [@:=, 0, [@tl, [@var, 0]]]\n`
			+ `    ]]\n`
			+ `], 1]\n`
		);
	});

	describe(`Follow padDisplayFormat options`, function () {
		it(`should follow pure formatting options`, function () {
			let pad: ProgDataType = [0, [
				['if', ['var', 0], [
					['while', ['var', 0], [
						[':=', 1, ['cons', ['hd', ['var', 0]], ['tl', ['var', 0]]]],
						[':=', 0, ['tl', ['var', 0]]]
					]],
				], [
					[':=', 1, ['quote', 'nil']],
				]]
			], 1];

			expect(displayPad(pad, PURE_DISPLAY_FORMAT)).to.deep.equal(``
				+ `[0, [\n`
				+ `    [if, [var, 0], [\n`
				+ `        [while, [var, 0], [\n`
				+ `            [:=, 1, [cons, [hd, [var, 0]], [tl, [var, 0]]]],\n`
				+ `            [:=, 0, [tl, [var, 0]]]\n`
				+ `        ]]\n`
				+ `    ], [\n`
				+ `        [:=, 1, [quote, nil]]\n`
				+ `    ]]\n`
				+ `], 1]\n`
			);
		});

		it(`should follow HWhile formatting options`, function () {
			let pad: ProgDataType = [0, [
				['if', ['var', 0], [
					['while', ['var', 0], [
						[':=', 1, ['cons', ['hd', ['var', 0]], ['tl', ['var', 0]]]],
						[':=', 0, ['tl', ['var', 0]]]
					]],
				], [
					[':=', 1, ['quote', 'nil']],
				]]
			], 1];

			expect(displayPad(pad, HWHILE_DISPLAY_FORMAT)).to.deep.equal(``
				+ `[0, [\n`
				+ `    [@if, [@var, 0], [\n`
				+ `        [@while, [@var, 0], [\n`
				+ `            [@:=, 1, [@cons, [@hd, [@var, 0]], [@tl, [@var, 0]]]],\n`
				+ `            [@:=, 0, [@tl, [@var, 0]]]\n`
				+ `        ]]\n`
				+ `    ], [\n`
				+ `        [@:=, 1, [@quote, nil]]\n`
				+ `    ]]\n`
				+ `], 1]\n`
			);
		});
	});
});
