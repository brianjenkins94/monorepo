/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/no-type-alias */

/**
 * Copyright 2016-2021 The Lovefield Project Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum ConstraintAction {
	RESTRICT = 0,
	CASCADE = 1
}

export enum Order {
	DESC = 0,
	ASC = 1
}

export enum Type {
	ARRAY_BUFFER = 0,
	BOOLEAN = 1,
	DATE_TIME = 2,
	INTEGER = 3,
	NUMBER = 4,
	STRING = 5,
	OBJECT = 6
}

const DEFAULT_VALUES: Map<Type, unknown> = new Map([
	[Type.ARRAY_BUFFER, null as unknown], // nullable
	[Type.BOOLEAN, false], // not nullable
	[Type.DATE_TIME, Object.freeze(new Date(0))], // not nullable
	[Type.INTEGER, 0], // not nullable
	[Type.NUMBER, 0], // not nullable
	[Type.STRING, ""], // not nullable
	[Type.OBJECT, null] // nullable
]);

enum TransactionType {
	READ_ONLY = 0,
	READ_WRITE = 1
}

enum ErrorCode {
	// System level errors
	SYSTEM_ERROR = 0,
	VERSION_MISMATCH = 1,
	CONNECTION_CLOSED = 2,
	TIMEOUT = 3,
	OPERATION_BLOCKED = 4,
	QUOTA_EXCEEDED = 5,
	TOO_MANY_ROWS = 6,
	SERVICE_NOT_FOUND = 7,
	UNKNOWN_PLAN_NODE = 8,

	// Data errors
	DATA_ERROR = 100,
	TABLE_NOT_FOUND = 101,
	DATA_CORRUPTION = 102,
	INVALID_ROW_ID = 103,
	INVALID_TX_ACCESS = 105,
	OUT_OF_SCOPE = 106,
	INVALID_TX_STATE = 107,
	INCOMPATIBLE_DB = 108,
	ROW_ID_EXISTED = 109,
	IMPORT_TO_NON_EMPTY_DB = 110,
	DB_MISMATCH = 111,
	IMPORT_DATA_NOT_FOUND = 112,
	ALREADY_CONNECTED = 113,

	// Integrity errors
	CONSTRAINT_ERROR = 200,
	DUPLICATE_KEYS = 201,
	NOT_NULLABLE = 202,
	FK_VIOLATION = 203,

	// Unsupported
	NOT_SUPPORTED = 300,
	FB_NO_RAW_TX = 351,
	IDB_NOT_PROVIDED = 352,
	WEBSQL_NOT_PROVIDED = 353,
	CANT_OPEN_WEBSQL_DB = 354,
	NO_CHANGE_NOTIFICATION = 355,
	NO_WEBSQL_TX = 356,
	NO_PRED_IN_TOSQL = 357,
	NOT_IMPL_IN_TOSQL = 358,
	LOCAL_STORAGE_NOT_PROVIDED = 359,
	NOT_IMPLEMENTED = 360,
	CANT_OPEN_IDB = 361,
	CANT_READ_IDB = 362,
	CANT_LOAD_IDB = 363,

	// Syntax errors
	SYNTAX_ERROR = 500,
	UNBOUND_VALUE = 501,
	INVALID_NAME = 502,
	NAME_IN_USE = 503,
	INVALID_AUTO_KEY_TYPE = 504,
	INVALID_AUTO_KEY_COLUMN = 505,
	IMMEDIATE_EVAL_ONLY = 506,
	COLUMN_NOT_FOUND = 508,
	COLUMN_NOT_INDEXABLE = 509,
	BIND_ARRAY_OUT_OF_RANGE = 510,
	CANT_GET_IDB_TABLE = 511,
	CANT_GET_WEBSQL_TABLE = 512,
	UNKNOWN_QUERY_CONTEXT = 513,
	UNKNOWN_NODE_TYPE = 514,
	DUPLICATE_FROM = 515,
	DUPLICATE_WHERE = 516,
	INVALID_DELETE = 517,
	INVALID_INSERT = 518,
	INVALID_INSERT_OR_REPLACE = 519,
	DUPLICATE_INTO = 520,
	DUPLICATE_VALUES = 521,
	INVALID_SELECT = 522,
	UNBOUND_LIMIT_SKIP = 523,
	INVALID_DISTINCT = 524,
	INVALID_GROUPBY = 525,
	INVALID_PROJECTION = 526,
	INVALID_AGGREGATION = 527,
	DUPLICATE_LIMIT = 528,
	DUPLICATE_SKIP = 529,
	DUPLICATE_GROUPBY = 530,
	NEGATIVE_LIMIT_SKIP = 531,
	INVALID_UPDATE = 532,
	FK_LOOP = 533,
	FK_COLUMN_IN_USE = 534,
	SCHEMA_FINALIZED = 535,
	INVALID_FK_TABLE = 536,
	INVALID_FK_COLUMN = 537,
	INVALID_FK_COLUMN_TYPE = 538,
	FK_COLUMN_NONUNIQUE = 539,
	INVALID_FK_REF = 540,
	INVALID_OUTER_JOIN = 541,
	MISSING_FROM_BEFORE_JOIN = 542,
	PK_CANT_BE_FK = 543,
	DUPLICATE_PK = 544,
	NULLABLE_PK = 545,
	DUPLICATE_NAME = 546,
	INVALID_WHERE = 547,
	FROM_AFTER_WHERE = 548,
	FROM_AFTER_ORDER_GROUPBY = 549,
	INVALID_PREDICATE = 550,

	// Test errors
	TEST_ERROR = 900,
	ASSERTION = 998,
	SIMULATED_ERROR = 999
}

interface Predicate {
	// Returns relation that holds only the entries satisfying given predicate.
	eval: (relation: Relation) => Relation;

	// Reverses the predicate: predicate evaluates to true where before it was
	// evaluating to false, and vice versa.
	setComplement: (isComplement: boolean) => void;

	// Returns a clone of the predicate.
	copy: () => Predicate;

	// Returns an array of all columns involved in this predicate. The optional
	// results array as the parameter holds previous results, given that this
	// function is called recursively.  If provided any column will be added on
	// that array. If not provided a new array will be allocated.
	getColumns: (results?: Column[]) => Column[];

	// Returns an array of all tables involved in this predicate. The optional
	// results array as the parameter holds previous results, given that this
	// function is called recursively.  If provided any table will be added on
	// that array. If not provided a new array will be allocated.
	getTables: (results?: Set<Table>) => Set<Table>;

	setId: (id: number) => void;
	getId: () => number;
}

type ValueOperandType = Binder | Date | boolean | number | string;
type OperandType = Column | ValueOperandType;

interface PredicateProvider {
	// Equal to
	eq: (operand: OperandType) => Predicate;

	// Not equal to
	neq: (operand: OperandType) => Predicate;

	// Less than
	lt: (operand: OperandType) => Predicate;

	// Less than or equals to
	lte: (operand: OperandType) => Predicate;

	// Greater than
	gt: (operand: OperandType) => Predicate;

	// Greater than or equals to
	gte: (operand: OperandType) => Predicate;

	// JavaScript regex match
	match: (operand: Binder | RegExp) => Predicate;

	// Between test: to must be greater or equals to from.
	between: (from: ValueOperandType, to: ValueOperandType) => Predicate;

	// Array finding
	in: (values: Binder | ValueOperandType[]) => Predicate;

	// Nullity test
	isNull: () => Predicate;

	// Non-nullity test
	isNotNull: () => Predicate;
}

// Public column interface
interface Column extends PredicateProvider {
	getName: () => string;
	getNormalizedName: () => string;

	// Different from original Lovefield, moved from BaseColumn to here.
	// This makes more sense since these getter calls are non-mutable and
	// easier for TypeScript users to determine how to proper cast.
	getTable: () => Table;
	getType: () => Type;
	isNullable: () => boolean;

	// Additional function call, not existent in original Lovefield.
	isUnique: () => boolean;

	// Alias the column, used in query.
	as: (alias: string) => Column;
}

// Public table interface.
interface Table {
	getName: () => string;
	as: (alias: string) => Table;
	createRow: (value?: object) => Row;

	// Individual accessor will return BaseColumn.
	// This conflicts to private members in TableImpl, therefore use a more
	// generic unknown type. Caller to dynamic cast public accessor to Column.
	[key: string]: unknown;

	// Given the indexed type is a big bummer in Typescript, add an additional
	// method to make life easier.
	col: (name: string) => Column;
}

type PayloadType = Record<string, unknown>;

interface RawRow {
	id: number;
	value: PayloadType;
}

// Interface that models a table in runtime. This is different from schema
// table. A runtime table is the collection of rows.
interface RuntimeTable {
	get: (ids: number[]) => Promise<Row[]>;
	put: (rows: Row[]) => Promise<void>;

	// If |disableClearTableOptimization| is true, implementations
	// will avoid an optimization that clears the entire table, as opposed to
	// removing specific rows. The optimization exists for cases where the
	// backstore determines that all rows are being removed. It isn't safe to do
	// this if we are also inserting rows into the same table. It is unsafe
	// because the put call can race with the remove call which is internally
	// doing a count before the remove. It would be much simpler to block on
	// the remove before calling put, but because of transaction life cycles
	// of IndexedDb on firefox, we can't do that. Callers must know to set this
	// parameter to true if they want to do a put on the same table in the same
	// transaction as this remove call.
	remove: (
		ids: number[],
		disableClearTableOptimization?: boolean
	) => Promise<void>;
}

interface TransactionStats {
	success: () => boolean;
	insertedRowCount: () => number;
	updatedRowCount: () => number;
	deletedRowCount: () => number;
	changedTableCount: () => number;
}

// Tx objects are wrappers of backstore-provided transactions. The interface
// defines common methods for these wrappers.
interface Tx {
	getTable: (
		tableName: string,
		deserializeFn: (value: RawRow) => Row,
		tableType: TableType
	) => RuntimeTable;

	// Returns the journal associated with this transaction.
	// The journal keeps track of all changes happened within the transaction.
	// Returns null if this is a READ_ONLY transaction.
	getJournal: () => Journal | null;

	// Commits transaction by applying all changes in this transaction's journal
	// to the backing store.
	commit: () => Promise<unknown>;

	// Aborts transaction. Caller shall listen to rejection of commit() to detect
	// end of transaction.
	abort: () => void;

	// Returns transaction stats if transaction is finalized, otherwise null.
	stats: () => TransactionStats | null;
}

// Interface for all backing stores to implement (Indexed DB, filesystem,
// memory etc).
interface BackStore {
	// Creates backstore native transaction that is tied to a given journal.
	createTx: (type: TransactionType, scope: Table[], journal?: Journal) => Tx;

	// Closes the database. This is just best-effort.
	close: () => void;

	// Returns one table based on table name.
	getTableInternal: (tableName: string) => RuntimeTable;

	// Whether this backstore supports the `import` operation.
	supportsImport: () => boolean;
}

// Models the return value of Database.getSchema().
interface Schema {
	name: () => string;
	tables: () => Table[];
	table: (name: string) => Table;
}

// TODO(arthurhsu): original SingleKey can be null.
type SingleKey = number | string;
type MultiKey = SingleKey[];
type Key = MultiKey | SingleKey;

type KeyRange = SingleKeyRange[];

/**
 * Comparator used to provide necessary information for building an index tree.
 * It offers methods to indicate which operand is "favorable".
 */
interface Comparator {
	compare: (lhs: Key, rhs: Key) => Favor;

	/**
	 * Returns an array of boolean which represents the relative positioning of
	 * a key to a range. The concept is to project both the key and the range onto
	 * the 1-D space. The returned array is in the form of [left, right]. If the
	 * range projection covers any value left/right of the key (including the key
	 * itself), then left/right will be set to true.
	 */
	compareRange: (key: Key, range: Range) => boolean[];

	/**
	 * Finds which one of the two operands is the minimum in absolute terms.
	 */
	min: (lhs: Key, rhs: Key) => Favor;

	/**
	 * Finds which one of the two operands is the maximum in absolute terms.
	 */
	max: (lhs: Key, rhs: Key) => Favor;

	isInRange: (key: Key, range: Range) => boolean;

	/**
	 * Whether the key's first dimension is in range's first dimension or not.
	 * For example, a key pair is [3, 5] and the range is [gt(3), gt(2)]. The
	 * B-Tree shall stop looping when the first key is out of range since the tree
	 * is sorted by first dimension.
	 */
	isFirstKeyInRange: (key: Key, range: Range) => boolean;

	/**
	 * Returns a range that represents all data.
	 */
	getAllRange: () => Range;

	/**
	 * Binds unbound values to given key ranges, and sorts them so that these
	 * ranges will be in the order from left to right.
	 */
	sortKeyRanges: (keyRanges: Range[]) => Range[];

	/**
	 * Returns true if the given range is open ended on the left-hand-side.
	 */
	isLeftOpen: (range: Range) => boolean;

	/**
	 * Converts key range to keys.
	 */
	rangeToKeys: (range: Range) => Key[];

	/**
	 * Returns false if any dimension of the key contains null.
	 */
	comparable: (key: Key) => boolean;

	/**
	 * Returns number of key dimensions.
	 */
	keyDimensions: () => number;
}

// Index used in runtime execution, lf.index.Index.
interface RuntimeIndex {
	// Returns normalized name for this index.
	getName: () => string;

	// Inserts data into index. If the key already existed, append value to the
	// value list. If the index does not support duplicate keys, adding duplicate
	// keys will result in throwing CONSTRAINT error.
	add: (key: Key | SingleKey, value: number) => void;

	// Replaces data in index. All existing data for that key will be purged.
	// If the key is not found, inserts the data.
	set: (key: Key | SingleKey, value: number) => void;

	// Deletes a row having given key from index. If not found return silently.
	// If |rowId| is given, delete a single row id when the index allows
	// duplicate keys. Ignored for index supporting only unique keys.
	remove: (key: Key | SingleKey, rowId?: number) => void;

	// Gets values from index. Returns empty array if not found.
	get: (key: Key | SingleKey) => number[];

	// Gets the cost of retrieving data for given range.
	cost: (keyRange?: KeyRange | SingleKeyRange) => number;

	// Retrieves all data within the range. Returns empty array if not found.
	// When multiple key ranges are specified, the function will return the
	// union of range query results. If none provided, all rowIds in this index
	// will be returned. Caller must ensure the ranges do not overlap.
	//
	// When |reverseOrder| is set to true, retrieves the results in the reverse
	// ordering of the index's comparator.
	// |limit| sets max number of rows to return, |skip| skips first N rows.
	getRange: (
		range?: KeyRange[] | SingleKeyRange[],
		reverseOrder?: boolean,
		limit?: number,
		skip?: number
	) => number[];

	// Removes everything from the tree.
	clear: () => void;

	// Special note for NULL: if the given index disallows NULL as key (e.g.
	// B-Tree), the containsKey will return garbage. Caller needs to be aware of
	// the behavior of the given index (this shall not be a problem with indices
	// that are properly wrapped by NullableIndex).
	containsKey: (key: Key | SingleKey) => boolean;

	// Returns an array of exactly two elements, holding the minimum key at
	// position 0, and all associated values at position 1. If no keys exist in
	// the index null is returned.
	min: () => unknown[] | null;

	// Returns an array of exactly two elements, holding the maximum key at
	// position 0, and all associated values at position 1. If no keys exist in
	// the index null is returned.
	max: () => unknown[] | null;

	// Serializes this index such that it can be persisted.
	serialize: () => Row[];

	// Returns the comparator used by this index.
	comparator: () => Comparator;

	// Whether the index accepts unique key only.
	isUniqueKey: () => boolean;

	// Returns the stats associated with this index.
	// Note: The returned object represents a snapshot of the index state at the
	// time this call was made. It is not guaranteed to be updated as the index
	// changes. Caller needs to call this method again if interested in latest
	// stats.
	stats: () => IndexStats;
}

interface IndexStore {
	// Initializes index store. This will create empty index instances.
	init: (schema: Schema) => Promise<void>;

	// Returns the index by full qualified name. Returns null if not found.
	get: (name: string) => RuntimeIndex | null;

	// Returns the indices for a given table or an empty array if no indices
	// exist.
	getTableIndices: (tableName: string) => RuntimeIndex[];

	// Sets the given index. If an index with the same name already exists it will
	// be overwritten.
	set: (tableName: string, index: RuntimeIndex) => void;
}
interface QueryEngine {
	// Returns the generated plan that can be understood by Runner.
	getPlan: (query: Context) => PhysicalQueryPlan;
}

// The comparison result constant. This must be consistent with the constant
// required by the sort function of Array.prototype.sort.
enum Favor {
	RHS = -1, // favors right hand side, i.e. lhs < rhs
	TIE = 0, // no favorite, i.e. lhs == rhs
	LHS = 1 // favors left hand side, i.e. lhs > rhs
}

enum TableType {
	DATA = 0,
	INDEX = 1
}

enum ExecType {
	NO_CHILD = -1, // Will not call any of its children's exec().
	ALL = 0, // Will invoke all children nodes' exec().
	FIRST_CHILD = 1 // Will invoke only the first child's exec().
}

enum LockType {
	EXCLUSIVE = 0,
	RESERVED_READ_ONLY = 1,
	RESERVED_READ_WRITE = 2,
	SHARED = 3
}

// The priority of each type of task. Lower number means higher priority.
enum TaskPriority {
	EXPORT_TASK = 0,
	IMPORT_TASK = 0,
	OBSERVER_QUERY_TASK = 0,
	EXTERNAL_CHANGE_TASK = 1,
	USER_QUERY_TASK = 2,
	TRANSACTION_TASK = 2
}

enum FnType {
	AVG = "AVG",
	COUNT = "COUNT",
	DISTINCT = "DISTINCT",
	GEOMEAN = "GEOMEAN",
	MAX = "MAX",
	MIN = "MIN",
	STDDEV = "STDDEV",
	SUM = "SUM"
}

enum Operator {
	AND = "and",
	OR = "or"
}

class Resolver<T> {
	public readonly promise: Promise<T>;

	private resolveFn!: (value?: PromiseLike<T> | T | undefined) => void;

	private rejectFn!: (reason?: object) => void;

	public constructor() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
	}

	public resolve(value?: PromiseLike<T> | T): void {
		this.resolveFn(value);
	}

	public reject(reason?: object): void {
		this.rejectFn(reason);
	}
}

class UniqueId {
	private static nextId = 0;

	uniqueNumber!: number;

	getUniqueNumber(): number {
		if (this.uniqueNumber === undefined) {
			this.uniqueNumber = ++UniqueId.nextId;
		}
		return this.uniqueNumber;
	}
}

// An array of exactly 2 elements representing the modification of a single row.
// Position 0 is the before value, position 1 is the after value. Null indicates
// that the row is either being inserted (no before value) or is being deleted
// (no after value).
type Modification = [Row | null, Row | null];

class InMemoryUpdater {
	private readonly cache: Cache;

	private readonly indexStore: IndexStore;

	private readonly schema: Schema;

	constructor(schema, cache, indexStore) {
		this.cache = cache;
		this.indexStore = indexStore;
		this.schema = schema;
	}

	// Updates all indices and the cache to reflect the changes that are described
	// in the given diffs.
	update(tableDiffs: TableDiff[]): void {
		tableDiffs.forEach((tableDiff) => {
			this.updateIndicesForDiff(tableDiff);
			this.updateCacheForDiff(tableDiff);
		}, this);
	}

	// Updates all indices that are affected as a result of the given
	// modification. In the case where an exception is thrown (constraint
	// violation) all the indices are unaffected.
	updateTableIndicesForRow(table: Table, modification: Modification): void {
		const indices = this.indexStore.getTableIndices(table.getName());
		let updatedIndices = 0;
		indices.forEach((index) => {
			try {
				this.updateTableIndexForRow(index, modification);
				updatedIndices++;
			} catch (e) {
				// Rolling back any indices that were successfully updated, since
				// updateTableIndicesForRow must be atomic.
				indices.slice(0, updatedIndices).forEach((idx) => {
					this.updateTableIndexForRow(idx, [modification[1], modification[0]]);
				}, this);

				// Forwarding the exception to the caller.
				throw e;
			}
		}, this);
	}

	// Updates the cache based on the given table diff.
	private updateCacheForDiff(diff: TableDiff): void {
		const tableName = diff.getName();
		diff
			.getDeleted()
			.forEach((row, rowId) => { this.cache.remove(tableName, rowId); });
		diff.getAdded().forEach((row) => { this.cache.set(tableName, row); });
		diff
			.getModified()
			.forEach((modification) => { this.cache.set(tableName, modification[1]); });
	}

	// Updates index data structures based on the given table diff.
	private updateIndicesForDiff(diff: TableDiff): void {
		const table = this.schema.table(diff.getName());
		const modifications = diff.getAsModifications();
		modifications.forEach((modification) => {
			this.updateTableIndicesForRow(table, modification);
		}, this);
	}

	// Updates a given index to reflect a given row modification.
	private updateTableIndexForRow(
		index: RuntimeIndex,
		modification: Modification
	): void {
		// Using 'undefined' as a special value to indicate insertion/
		// deletion instead of 'null', since 'null' can be a valid index key.
		const keyNow = modification[1] === null ? undefined : modification[1].keyOfIndex(index.getName());
		const keyThen = modification[0] === null ? undefined : modification[0].keyOfIndex(index.getName());

		if (keyThen === undefined && keyNow !== undefined) {
			// Insertion
			index.add(keyNow, modification[1].id());
		} else if (keyThen !== undefined && keyNow !== undefined) {
			// Index comparators may not handle null, so handle it here for them.
			if (keyNow === null || keyThen === null) {
				if (keyNow === keyThen) {
					return;
				}
			} else if (index.comparator().compare(keyThen, keyNow) === Favor.TIE) {
				return;
			}

			// Update
			// NOTE: the order of calling add() and remove() here matters.
			// Index#add() might throw an exception because of a constraint
			// violation, in which case the index remains unaffected as expected.
			index.add(keyNow, modification[1].id());
			index.remove(keyThen, modification[0].id());
		} else if (keyThen !== undefined && keyNow === undefined) {
			// Deletion
			index.remove(keyThen, modification[0].id());
		}
	}
}

class TransactionStatsImpl implements TransactionStats {
	static getDefault(): TransactionStatsImpl {
		return new TransactionStatsImpl(false, 0, 0, 0, 0);
	}

	constructor(
		private readonly success_: boolean,
		private readonly insertedRowCount_: number,
		private readonly updatedRowCount_: number,
		private readonly deletedRowCount_: number,
		private readonly changedTableCount_: number
	) { }

	success(): boolean {
		return this.success_;
	}

	insertedRowCount(): number {
		return this.insertedRowCount_;
	}

	updatedRowCount(): number {
		return this.updatedRowCount_;
	}

	deletedRowCount(): number {
		return this.deletedRowCount_;
	}

	changedTableCount(): number {
		return this.changedTableCount_;
	}
}

function assert(condition: boolean, message = "assertion failed"): void {
	if (!condition) {
		throw new Exception(ErrorCode.ASSERTION, message);
	}
}

// A MapSet maps a key to a set of values, without allowing duplicate entries
// for a given key.
class MapSet<K, V> {
	private readonly map: Map<K, Set<V>>;

	private count: number;

	constructor() {
		this.map = new Map<K, Set<V>>();
		this.count = 0;
	}

	get size(): number {
		return this.count;
	}

	has(key: K): boolean {
		return this.map.has(key);
	}

	set(key: K, value: V): this {
		const valueSet = this.getSet(key);
		if (!valueSet.has(value)) {
			valueSet.add(value);
			this.count++;
		}
		return this;
	}

	setMany(key: K, values: V[]): this {
		const valueSet = this.getSet(key);
		values.forEach((value) => {
			if (!valueSet.has(value)) {
				valueSet.add(value);
				this.count++;
			}
		});
		return this;
	}

	merge(mapSet: MapSet<K, V>): this {
		mapSet
			.keys()
			.forEach((key) => this.setMany(key, Array.from(mapSet.getSet(key))));
		return this;
	}

	get(key: K): V[] | null {
		const valueSet = this.map.get(key) || null;
		return valueSet === null ? null : Array.from(valueSet);
	}

	keys(): K[] {
		return Array.from(this.map.keys());
	}

	values(): V[] {
		const results: V[] = [];
		this.map.forEach((valueSet) => results.push(...Array.from(valueSet)));
		return results;
	}

	// Returns a set for a given key. If the key does not exist in the map,
	// a new Set will be created.
	getSet(key: K): Set<V> {
		let valueSet = this.map.get(key) || null;
		if (valueSet === null) {
			valueSet = new Set<V>();
			this.map.set(key, valueSet);
		}
		return valueSet;
	}
}

interface Index {
	getNormalizedName: () => string;

	// Whether this index refers to any column that is marked as nullable.
	hasNullableColumn: () => boolean;
}

interface BaseTable extends Table {
	getColumns: () => Column[];
	getIndices: () => Index[];
	persistentIndex: () => boolean;
	getAlias: () => string;
	getEffectiveName: () => string;
	getRowIdIndexName: () => string;
	deserializeRow: (dbRecord: RawRow) => Row;
}

interface BaseColumn extends Column {
	getAlias: () => string;
	getIndices: () => Index[];
	// The index that refers only to this column, or null if such index does
	// not exist.
	getIndex: () => Index | null;

	// Accessor returns unknown to meet the design of DEFAULT_VALUES.
	[key: string]: unknown;
}

class TableDiff {
	private readonly added: Map<number, Row>;

	private readonly modified: Map<number, Modification>;

	private readonly deleted: Map<number, Row>;

	constructor(private readonly name: string) {
		this.added = new Map();
		this.modified = new Map();
		this.deleted = new Map();
	}

	getName(): string {
		return this.name;
	}

	getAdded(): Map<number, Row> {
		return this.added;
	}

	getModified(): Map<number, Modification> {
		return this.modified;
	}

	getDeleted(): Map<number, Row> {
		return this.deleted;
	}

	add(row: Row): void {
		if (this.deleted.has(row.id())) {
			const modification: Modification = [
				this.deleted.get(row.id()) as unknown as Row,
				row
			];
			this.modified.set(row.id(), modification);
			this.deleted.delete(row.id());
		} else {
			this.added.set(row.id(), row);
		}
	}

	modify(modification: Modification): void {
		const oldValue = modification[0] as unknown as Row;
		const newValue = modification[1] as unknown as Row;
		assert(oldValue.id() === newValue.id(), "Row ID mismatch between old/new values.");
		const id = oldValue.id();

		if (this.added.has(id)) {
			this.added.set(id, newValue);
		} else if (this.modified.has(id)) {
			const overallModification: Modification = [
				(this.modified.get(id) as unknown as Modification)[0],
				newValue
			];
			this.modified.set(id, overallModification);
		} else {
			this.modified.set(id, modification);
		}
	}

	delete(row: Row): void {
		if (this.added.has(row.id())) {
			this.added.delete(row.id());
		} else if (this.modified.has(row.id())) {
			const originalRow = (
				this.modified.get(row.id()) as unknown as Modification
			)[0] as unknown as Row;
			this.modified.delete(row.id());
			this.deleted.set(row.id(), originalRow);
		} else {
			this.deleted.set(row.id(), row);
		}
	}

	// Transforms each changes included in this diff (insertion, modification,
	// deletion) as a pair of before and after values.
	// Example addition:     [null, rowValue]
	// Example modification: [oldRowValue, newRowValue]
	// Example deletion      [oldRowValue, null]
	getAsModifications(): Modification[] {
		const modifications: Modification[] = [];

		this.added.forEach((row) => modifications.push([null, /* now */ row]));
		this.modified.forEach((modification) => modifications.push(modification));
		this.deleted.forEach((row) => modifications.push([row, /* now */ null]));

		return modifications;
	}

	toString(): string {
		return (
			`[${Array.from(this.added.keys()).toString()}], `
			+ `[${Array.from(this.modified.keys()).toString()}], `
			+ `[${Array.from(this.deleted.keys()).toString()}]`
		);
	}

	// Reverses this set of changes. Useful for reverting changes after they have
	// been applied.
	getReverse(): TableDiff {
		const reverseDiff = new TableDiff(this.name);

		this.added.forEach((row) => {
			reverseDiff.delete(row);
		});
		this.deleted.forEach((row) => {
			reverseDiff.add(row);
		});
		this.modified.forEach((modification) => {
			reverseDiff.modify([modification[1], modification[0]]);
		});

		return reverseDiff;
	}
}

// A transaction journal which is contained within Tx. The journal
// stores rows changed by this transaction so that they can be merged into the
// backing store. Caches and indices are updated as soon as a change is
// recorded in the journal.
class Journal {
	private readonly scope: Map<string, Table>;
	private readonly indexStore: IndexStore;
	private readonly inMemoryUpdater: InMemoryUpdater;

	// A terminated journal can no longer be modified or rolled back. This should
	// be set to true only after the changes in this Journal have been reflected
	// in the backing store, or the journal has been rolled back.
	private terminated: boolean;

	// When a constraint violation happens the journal becomes not writable
	// anymore and the only operation that is allowed is rolling back. Callers
	// of Journal#insert,insertOrReplace,update,remove *must* rollback the journal
	// if any lf.Exception is thrown, otherwise the index data structures will not
	// reflect what is in the database.
	private pendingRollback: boolean;

	// The changes that have been applied since the start of this journal. The
	// keys are table names, and the values are changes that have happened per
	// table.
	private readonly tableDiffs: Map<string, TableDiff>;

	constructor(schema, cache, indexStore, txScope: Set<Table>) {
		this.scope = new Map<string, Table>();
		txScope.forEach((tableSchema) => this.scope.set(tableSchema.getName(), tableSchema));

		this.indexStore = indexStore;
		this.inMemoryUpdater = new InMemoryUpdater(schema, cache, indexStore);
		this.terminated = false;
		this.pendingRollback = false;
		this.tableDiffs = new Map<string, TableDiff>();
	}

	getDiff(): Map<string, TableDiff> {
		return this.tableDiffs;
	}

	// Returns the indices that were modified in this within this journal.
	// TODO(dpapad): Indices currently can't provide a diff, therefore the entire
	// index is flushed into disk every time, even if only one leaf-node changed.
	getIndexDiff(): RuntimeIndex[] {
		const tableSchemas = Array.from(this.tableDiffs.keys()).map((tableName) => this.scope.get(tableName));

		const indices: RuntimeIndex[] = [];
		tableSchemas.forEach((tblSchema) => {
			const tableSchema = tblSchema as BaseTable;
			if (tableSchema.persistentIndex()) {
				const tableIndices = tableSchema.getIndices();
				tableIndices.forEach((indexSchema) => {
					indices.push(this.indexStore.get(indexSchema.getNormalizedName()));
				}, this);
				indices.push(this.indexStore.get(tableSchema.getName() + ".#"));
			}
		}, this);
		return indices;
	}

	getScope(): Map<string, Table> {
		return this.scope;
	}

	// Commits journal changes into cache and indices.
	commit(): void {
		this.assertJournalWritable();
		this.terminated = true;
	}

	// Rolls back all the changes that were made in this journal from the cache
	// and indices.
	rollback(): void {
		assert(!this.terminated, "Attempted to rollback a terminated journal.");

		const reverseDiffs = Array.from(this.tableDiffs.values()).map((tableDiff) => tableDiff.getReverse());
		this.inMemoryUpdater.update(reverseDiffs);

		this.terminated = true;
		this.pendingRollback = false;
	}

	// Asserts that this journal can still be used.
	private assertJournalWritable(): void {
		assert(!this.pendingRollback, "Attempted to use journal that needs to be rolled back.");
		assert(!this.terminated, "Attempted to commit a terminated journal.");
	}
}

// Binder class that instructs the query engine to evaluate bound value at
// execution time.
class Binder {
	constructor(readonly index: number) { }

	getIndex(): number {
		return this.index;
	}
}

enum EvalType {
	BETWEEN = "between",
	EQ = "eq",
	GTE = "gte",
	GT = "gt",
	IN = "in",
	LTE = "lte",
	LT = "lt",
	MATCH = "match",
	NEQ = "neq"
}

type ValueType = boolean | number | string;

function identity<T>(value: T): T {
	return value;
}

// ComparisonFunction is a special type that needs to allow any.
type ComparisonFunction = (l: any, r: any) => boolean;
type IndexableType = Date | ValueType;
type KeyOfIndexFunction = (key: IndexableType) => ValueType;

/**
 * Builds a map associating evaluator types with the evaluator functions, for
 * the case of a column of type 'boolean'.
 * NOTE: lf.eval.Type.BETWEEN, MATCH, GTE, GT, LTE, LT, are not available for
 * boolean objects.
 */
function buildKeyOfIndexConversionMap(): Map<Type, KeyOfIndexFunction> {
	const map = new Map<Type, KeyOfIndexFunction>();
	map.set(Type.BOOLEAN, ((value: boolean) => {
		return value === null ? null : value ? 1 : 0;
	}) as KeyOfIndexFunction);
	map.set(Type.DATE_TIME, ((value: Date) => {
		return value === null ? null : value.getTime();
	}) as KeyOfIndexFunction);

	map.set(Type.INTEGER, identity as KeyOfIndexFunction);
	map.set(Type.NUMBER, identity as KeyOfIndexFunction);
	map.set(Type.STRING, identity as KeyOfIndexFunction);
	return map;
}

/**
 * Builds a map associating evaluator types with the evaluator functions, for
 * the case of a column of type 'boolean'.
 * NOTE: lf.eval.Type.BETWEEN, MATCH, GTE, GT, LTE, LT, are not available for
 * boolean objects.
 */
function buildBooleanEvaluatorMap(): Map<EvalType, ComparisonFunction> {
	const map = new Map<EvalType, ComparisonFunction>();
	map.set(EvalType.EQ, (a: ValueType, b: ValueType) => a === b);
	map.set(EvalType.NEQ, (a: ValueType, b: ValueType) => a !== b);
	return map;
}

type RangeType = ValueType[];
type ListType = ValueType[];

function buildCommonEvaluatorMap(): Map<EvalType, ComparisonFunction> {
	const map = buildBooleanEvaluatorMap();
	map.set(EvalType.BETWEEN, (a: ValueType, range: RangeType) => {
		return a === null || range[0] === null || range[1] === null ? false : a >= range[0] && a <= range[1];
	});
	map.set(EvalType.GTE, (a: ValueType, b: ValueType) => {
		return a === null || b === null ? false : a >= b;
	});
	map.set(EvalType.GT, (a: ValueType, b: ValueType) => {
		return a === null || b === null ? false : a > b;
	});
	map.set(EvalType.IN, (rowValue: ValueType, values: ListType) => {
		return values.includes(rowValue);
	});
	map.set(EvalType.LTE, (a: ValueType, b: ValueType) => {
		return a === null || b === null ? false : a <= b;
	});
	map.set(EvalType.LT, (a: ValueType, b: ValueType) => {
		return a === null || b === null ? false : a < b;
	});
	return map;
}

/**
 * Builds a map associating evaluator types with the evaluator functions, for
 * the case of a column of type 'number'.
 * NOTE: lf.eval.Type.MATCH is not available for numbers.
 */
const buildNumberEvaluatorMap = buildCommonEvaluatorMap;

/**
 * Builds a map associating evaluator types with the evaluator functions, for
 * the case of a column of type 'string'.
 */
function buildStringEvaluatorMap(): Map<EvalType, ComparisonFunction> {
	const map = buildCommonEvaluatorMap();
	map.set(EvalType.MATCH, (value, regex) => {
		if (value === null || regex === null) {
			return false;
		}
		const re = new RegExp(regex);
		return re.test(value);
	});
	return map;
}

/**
 * Builds a map associating evaluator types with the evaluator functions, for
 * the case of a column of type 'Object'.
 * NOTE: Only lf.eval.Type.EQ and NEQ are available for objects.
 */
function buildObjectEvaluatorMap(): Map<EvalType, ComparisonFunction> {
	const map = new Map<EvalType, ComparisonFunction>();

	const checkNull = (value: object) => {
		if (value !== null) {
			// 550: where() clause includes an invalid predicate, can't compare
			// lf.Type.OBJECT to anything other than null.
			throw new Exception(ErrorCode.INVALID_PREDICATE);
		}
	};
	map.set(EvalType.EQ, (a: object, b: object) => {
		checkNull(b);
		return a === null;
	});
	map.set(EvalType.NEQ, (a: object, b: object) => {
		checkNull(b);
		return a !== null;
	});
	return map;
}

/**
 * Builds a map associating evaluator types with the evaluator functions, for
 * the case of a column of type 'Date'.
 * NOTE: lf.eval.Type.MATCH is not available for Date objects.
 */
function buildDateEvaluatorMap(): Map<EvalType, ComparisonFunction> {
	const map = new Map<EvalType, ComparisonFunction>();
	map.set(EvalType.BETWEEN, (a: Date, range: Date[]) => {
		return a === null || range[0] === null || range[1] === null ? false : a.getTime() >= range[0].getTime() && a.getTime() <= range[1].getTime();
	});
	map.set(EvalType.EQ, (a: Date, b: Date) => {
		const aTime = a === null ? -1 : a.getTime();
		const bTime = b === null ? -1 : b.getTime();
		return aTime === bTime;
	});
	map.set(EvalType.GTE, (a: Date, b: Date) => {
		return a === null || b === null ? false : a.getTime() >= b.getTime();
	});
	map.set(EvalType.GT, (a: Date, b: Date) => {
		return a === null || b === null ? false : a.getTime() > b.getTime();
	});
	map.set(EvalType.IN, (targetValue: Date, values: Date[]) => {
		return values.some((value) => value.getTime() === targetValue.getTime());
	});
	map.set(EvalType.LTE, (a: Date, b: Date) => {
		return a === null || b === null ? false : a.getTime() <= b.getTime();
	});
	map.set(EvalType.LT, (a: Date, b: Date) => {
		return a === null || b === null ? false : a.getTime() < b.getTime();
	});
	map.set(EvalType.NEQ, (a: Date, b: Date) => {
		const aTime = a === null ? -1 : a.getTime();
		const bTime = b === null ? -1 : b.getTime();
		return aTime !== bTime;
	});
	return map;
}
class EvalRegistry {
	static get(): EvalRegistry {
		EvalRegistry.instance = EvalRegistry.instance || new EvalRegistry();
		return EvalRegistry.instance;
	}

	private static instance: EvalRegistry;

	// A map holding functions used for converting a value of a given type to the
	// equivalent index key. NOTE: No functions exist in this map for
	// lf.Type.ARRAY_BUFFER and lf.Type.OBJECT, since columns of such types are
	// not indexable.
	private readonly keyOfIndexConversionMap: Map<Type, KeyOfIndexFunction>;

	// A two-level map, associating a column type to the corresponding evaluation
	// functions map.
	// NOTE: No evaluation map exists for lf.Type.ARRAY_BUFFER since predicates
	// involving such a column do not make sense.
	private readonly evalMaps: Map<Type, Map<EvalType, ComparisonFunction>>;

	constructor() {
		this.keyOfIndexConversionMap = buildKeyOfIndexConversionMap();
		this.evalMaps = new Map<Type, Map<EvalType, ComparisonFunction>>();
		const numberOrIntegerEvalMap = buildNumberEvaluatorMap();

		this.evalMaps.set(Type.BOOLEAN, buildBooleanEvaluatorMap());
		this.evalMaps.set(Type.DATE_TIME, buildDateEvaluatorMap());
		this.evalMaps.set(Type.NUMBER, numberOrIntegerEvalMap);
		this.evalMaps.set(Type.INTEGER, numberOrIntegerEvalMap);
		this.evalMaps.set(Type.STRING, buildStringEvaluatorMap());
		this.evalMaps.set(Type.OBJECT, buildObjectEvaluatorMap());
	}

	getEvaluator(columnType: Type, evaluatorType: EvalType): ComparisonFunction {
		const evaluationMap = this.evalMaps.get(columnType) || null;
		if (evaluationMap === null) {
			// 550: where() clause includes an invalid predicate. Could not find
			// evaluation map for the given column type.
			throw new Exception(ErrorCode.INVALID_PREDICATE);
		}

		const evaluatorFn = evaluationMap.get(evaluatorType) || null;
		if (evaluatorFn === null) {
			// 550: where() clause includes an invalid predicate. Could not find
			// evaluation map for the given column type.
			throw new Exception(ErrorCode.INVALID_PREDICATE);
		}
		return evaluatorFn;
	}

	getKeyOfIndexEvaluator(columnType: Type): KeyOfIndexFunction {
		const fn = this.keyOfIndexConversionMap.get(columnType) || null;
		if (fn === null) {
			// 300: Not supported
			throw new Exception(ErrorCode.NOT_SUPPORTED);
		}
		return fn;
	}
}

// Unbound is used to denote an unbound key range boundary.
class UnboundKey { }

// A SingleKeyRange represents a key range of a single column.
class SingleKeyRange {
	static UNBOUND_VALUE: UnboundKey = new UnboundKey();

	static isUnbound(value: SingleKey | UnboundKey): boolean {
		return value === SingleKeyRange.UNBOUND_VALUE;
	}

	static upperBound(key: SingleKey, shouldExclude = false): SingleKeyRange {
		return new SingleKeyRange(SingleKeyRange.UNBOUND_VALUE, key, false, shouldExclude);
	}

	static lowerBound(key: SingleKey, shouldExclude = false): SingleKeyRange {
		return new SingleKeyRange(key, SingleKeyRange.UNBOUND_VALUE, shouldExclude, false);
	}

	// Creates a range that includes a single key.
	static only(key: SingleKey): SingleKeyRange {
		return new SingleKeyRange(key, key, false, false);
	}

	// Creates a range that includes all keys.
	static all(): SingleKeyRange {
		return new SingleKeyRange(SingleKeyRange.UNBOUND_VALUE, SingleKeyRange.UNBOUND_VALUE, false, false);
	}

	static xor(a: boolean, b: boolean): boolean {
		return a ? !b : b;
	}

	// Compares two ranges, meant to be used in Array#sort.
	static compare(lhs: SingleKeyRange, rhs: SingleKeyRange): Favor {
		let result = SingleKeyRange.compareKey(lhs.from, rhs.from, true, lhs.excludeLower, rhs.excludeLower);
		if (result === Favor.TIE) {
			result = SingleKeyRange.compareKey(lhs.to, rhs.to, false, lhs.excludeUpper, rhs.excludeUpper);
		}
		return result;
	}

	// Returns a new range that is the minimum range that covers both ranges
	// given.
	static getBoundingRange(
		r1: SingleKeyRange,
		r2: SingleKeyRange
	): SingleKeyRange {
		let from = SingleKeyRange.UNBOUND_VALUE;
		let to = SingleKeyRange.UNBOUND_VALUE;
		let excludeLower = false;
		let excludeUpper = false;

		if (
			!SingleKeyRange.isUnbound(r1.from)
			&& !SingleKeyRange.isUnbound(r2.from)
		) {
			const favor = SingleKeyRange.compareKey(r1.from, r2.from, true);
			if (favor !== Favor.LHS) {
				from = r1.from;
				excludeLower = favor !== Favor.TIE ? r1.excludeLower : r1.excludeLower && r2.excludeLower;
			} else {
				from = r2.from;
				excludeLower = r2.excludeLower;
			}
		}
		if (!SingleKeyRange.isUnbound(r1.to) && !SingleKeyRange.isUnbound(r2.to)) {
			const favor = SingleKeyRange.compareKey(r1.to, r2.to, false);
			if (favor !== Favor.RHS) {
				to = r1.to;
				excludeUpper = favor !== Favor.TIE ? r1.excludeUpper : r1.excludeUpper && r2.excludeUpper;
			} else {
				to = r2.to;
				excludeUpper = r2.excludeUpper;
			}
		}
		return new SingleKeyRange(from, to, excludeLower, excludeUpper);
	}

	// Intersects two ranges and return their intersection.
	// Returns null if intersection is empty.
	static and(r1: SingleKeyRange, r2: SingleKeyRange): SingleKeyRange {
		if (!r1.overlaps(r2)) {
			return null as unknown as SingleKeyRange;
		}

		let favor = SingleKeyRange.compareKey(r1.from, r2.from, true);
		const left = favor === Favor.TIE ? r1.excludeLower ? r1 : r2 : favor !== Favor.RHS ? r1 : r2;

		// right side boundary test is different, null is considered greater.
		let right: SingleKeyRange;
		if (SingleKeyRange.isUnbound(r1.to) || SingleKeyRange.isUnbound(r2.to)) {
			right = SingleKeyRange.isUnbound(r1.to) ? r2 : r1;
		} else {
			favor = SingleKeyRange.compareKey(r1.to, r2.to, false);
			right = favor === Favor.TIE ? r1.excludeUpper ? r1 : r2 : favor === Favor.RHS ? r1 : r2;
		}
		return new SingleKeyRange(left.from, right.to, left.excludeLower, right.excludeUpper);
	}

	// Calculates the complement key ranges of the input key ranges.
	// NOTE: The key ranges passed in this method must satisfy "isOnly() == true",
	// and none of from/to should be null.
	static complement(keyRanges: SingleKeyRange[]): SingleKeyRange[] {
		if (keyRanges.length === 0) {
			return SingleKeyRange.EMPTY_RANGE;
		}

		keyRanges.sort(SingleKeyRange.compare);
		const complementKeyRanges = new Array(keyRanges.length + 1);
		for (let i = 0; i < complementKeyRanges.length; i++) {
			if (i === 0) {
				complementKeyRanges[i] = SingleKeyRange.upperBound(keyRanges[i].from as SingleKey, true);
			} else if (i === complementKeyRanges.length - 1) {
				complementKeyRanges[i] = SingleKeyRange.lowerBound(keyRanges[i - 1].to as SingleKey, true);
			} else {
				complementKeyRanges[i] = new SingleKeyRange(keyRanges[i - 1].to, keyRanges[i].from, true, true);
			}
		}
		return complementKeyRanges;
	}

	private static readonly EMPTY_RANGE: SingleKeyRange[] = [];

	private static compareKey(
		l: SingleKey | UnboundKey,
		r: SingleKey | UnboundKey,
		isLeftHandSide: boolean,
		excludeL = false,
		excludeR = false
	): Favor {
		const flip = (favor: Favor) => (isLeftHandSide ? favor : favor === Favor.LHS ? Favor.RHS : Favor.LHS);

		// The following logic is implemented for LHS. RHS is achieved using flip().
		const tieLogic = () => (!SingleKeyRange.xor(excludeL, excludeR)
			? Favor.TIE
			: excludeL
				? flip(Favor.LHS)
				: flip(Favor.RHS));

		if (SingleKeyRange.isUnbound(l)) {
			return !SingleKeyRange.isUnbound(r) ? flip(Favor.RHS) : tieLogic();
		}
		return SingleKeyRange.isUnbound(r) ? flip(Favor.LHS) : l < r ? Favor.RHS : l === r ? tieLogic() : Favor.LHS;
	}

	readonly excludeLower: boolean;

	readonly excludeUpper: boolean;

	constructor(
		readonly from: SingleKey | UnboundKey,
		readonly to: SingleKey | UnboundKey,
		excludeLower: boolean,
		excludeUpper: boolean
	) {
		this.excludeLower = !SingleKeyRange.isUnbound(this.from) ? excludeLower : false;
		this.excludeUpper = !SingleKeyRange.isUnbound(this.to) ? excludeUpper : false;
	}

	// A text representation of this key range, useful for tests.
	// Example: [a, b] means from a to b, with both a and b included in the range.
	// Example: (a, b] means from a to b, with a excluded, b included.
	// Example: (a, b) means from a to b, with both a and b excluded.
	// Example: [unbound, b) means anything less than b, with b not included.
	// Example: [a, unbound] means anything greater than a, with a included.
	toString(): string {
		return (
			(this.excludeLower ? "(" : "[")
			+ (SingleKeyRange.isUnbound(this.from) ? "unbound" : this.from)
			+ ", "
			+ (SingleKeyRange.isUnbound(this.to) ? "unbound" : this.to)
			+ (this.excludeUpper ? ")" : "]")
		);
	}

	// Reverses a keyRange such that "lower" refers to larger values and "upper"
	// refers to smaller values. Note: This is different than what complement()
	// does.
	reverse(): SingleKeyRange {
		return new SingleKeyRange(this.to, this.from, this.excludeUpper, this.excludeLower);
	}

	// Determines if this range overlaps with the given one.
	overlaps(range: SingleKeyRange): boolean {
		const favor = SingleKeyRange.compareKey(this.from, range.from, true, this.excludeLower, range.excludeLower);
		if (favor === Favor.TIE) {
			return true;
		}
		const left = favor === Favor.RHS ? this : range;
		const right = favor === Favor.LHS ? this : range;

		return (
			SingleKeyRange.isUnbound(left.to)
			|| left.to > right.from
			|| left.to === right.from && !left.excludeUpper && !right.excludeLower
		);
	}

	// Returns whether the range is all.
	isAll(): boolean {
		return (
			SingleKeyRange.isUnbound(this.from) && SingleKeyRange.isUnbound(this.to)
		);
	}

	// Returns if the range is only.
	isOnly(): boolean {
		return (
			this.from === this.to
			&& !SingleKeyRange.isUnbound(this.from)
			&& !this.excludeLower
			&& !this.excludeUpper
		);
	}
}

class SingleKeyRangeSet {
	// Intersection of two range sets.
	static intersect(
		s0: SingleKeyRangeSet,
		s1: SingleKeyRangeSet
	): SingleKeyRangeSet {
		const ranges = s0.getValues().map((r0) => {
			return s1.getValues().map((r1) => SingleKeyRange.and(r0, r1));
		});

		let results: SingleKeyRange[] = [];
		ranges.forEach((dimension) => results = results.concat(dimension));

		return new SingleKeyRangeSet(results.filter((r) => r !== null));
	}

	private ranges: SingleKeyRange[];

	constructor(ranges?: SingleKeyRange[]) {
		this.ranges = [];
		if (ranges) {
			this.add(ranges);
		}
	}

	toString(): string {
		return this.ranges.map((r) => r.toString()).join(",");
	}

	getValues(): SingleKeyRange[] {
		return this.ranges;
	}

	add(keyRanges: SingleKeyRange[]): void {
		if (keyRanges.length === 0) {
			return;
		}

		const ranges = this.ranges.concat(keyRanges);
		if (ranges.length === 1) {
			this.ranges = ranges;
			return;
		}

		ranges.sort(SingleKeyRange.compare);
		const results: SingleKeyRange[] = [];
		let start = ranges[0];
		for (let i = 1; i < ranges.length; ++i) {
			if (start.overlaps(ranges[i])) {
				start = SingleKeyRange.getBoundingRange(start, ranges[i]);
			} else {
				results.push(start);
				start = ranges[i];
			}
		}
		results.push(start);
		this.ranges = results;
	}
}

// Whether set2 is a subset of set1
function isSubset<T>(set1: Set<T>, set2: Set<T>): boolean {
	if (set2.size > set1.size) {
		return false;
	}

	let result = true;
	set2.forEach((value) => result = result && set1.has(value));
	return result;
}

function setEquals<T>(set1: Set<T>, set2: Set<T>): boolean {
	return set1.size === set2.size && isSubset(set1, set2);
}

// The base row class for all rows.
class Row {
	// An ID to be used when a row that does not correspond to a DB entry is
	// created (for example the result of joining two rows).
	static DUMMY_ID = -1;

	// Get the next unique row ID to use for creating a new instance.
	static getNextId(): number {
		return Row.nextId++;
	}

	// Creates a new Row instance from DB data.
	static deserialize(data: RawRow): Row {
		return new Row(data.id, data.value);
	}

	// ArrayBuffer to hex string.
	static binToHex(buffer: ArrayBuffer | null): string | null {
		if (buffer === null) {
			return null;
		}

		const uint8Array = new Uint8Array(buffer);
		let s = "";
		uint8Array.forEach((c) => {
			const chr = c.toString(16);
			s += chr.length < 2 ? "0" + chr : chr;
		});
		return s;
	}

	// Hex string to ArrayBuffer.
	static hexToBin(hex: string | null): ArrayBuffer | null {
		if (hex === null || hex === "") {
			return null;
		}

		if (hex.length % 2 !== 0) {
			hex = "0" + hex;
		}
		const buffer = new ArrayBuffer(hex.length / 2);
		const uint8Array = new Uint8Array(buffer);
		for (let i = 0, j = 0; i < hex.length; i += 2) {
			uint8Array[j++] = Number(`0x${hex.substr(i, 2)}`) & 0xff;
		}
		return buffer;
	}

	// The ID to assign to the next row that will be created.
	// Should be initialized to the appropriate value from the BackStore instance
	// that is being used.
	private static nextId: number = Row.DUMMY_ID + 1;

	protected payload_: PayloadType;

	constructor(private id_: number, payload?: PayloadType) {
		this.payload_ = payload || this.defaultPayload();
	}

	id(): number {
		return this.id_;
	}

	payload(): PayloadType {
		return this.payload_;
	}

	defaultPayload(): PayloadType {
		return {};
	}

	toDbPayload(): PayloadType {
		return this.payload_;
	}

	serialize(): RawRow {
		return { "id": this.id_, "value": this.toDbPayload() };
	}

	keyOfIndex(indexName: string): Key {
		if (indexName.substr(-1) === "#") {
			return this.id_ as Key;
		}

		// Remaining indices keys are implemented by overriding keyOfIndex in
		// subclasses.
		return null as unknown as Key;
	}
}

/**
 * Each RelationEntry represents a row that is passed from one execution step
 * to another and does not necessarily correspond to a physical row in a DB
 * table (as it can be the result of a cross-product/join operation).
 */
class RelationEntry {
	// Combines two entries into a single entry.
	static combineEntries(
		leftEntry: RelationEntry,
		leftEntryTables: string[],
		rightEntry: RelationEntry,
		rightEntryTables: string[]
	): RelationEntry {
		const result: PayloadType = {};
		const mergeEntry = (entry: RelationEntry, entryTables: string[]) => {
			if (entry.isPrefixApplied) {
				const payload = entry.row.payload();
				Array.from(Object.keys(payload)).forEach((prefix) => {
					result[prefix] = payload[prefix];
				});
			} else {
				assert(!Object.prototype.hasOwnProperty.call(result, entryTables[0]), "Attempted to join table with itself, without using table alias, "
					+ "or same alias "
					+ entryTables[0]
					+ "is reused for multiple tables.");

				// Since the entry is not prefixed, all attributes come from a single
				// table.
				result[entryTables[0]] = entry.row.payload();
			}
		};

		mergeEntry(leftEntry, leftEntryTables);
		mergeEntry(rightEntry, rightEntryTables);

		const row = new Row(Row.DUMMY_ID, result);
		return new RelationEntry(row, true);
	}

	// The ID to assign to the next entry that will be created.
	private static nextId = 0;

	private static getNextId(): number {
		return RelationEntry.nextId++;
	}

	id: number;

	// |isPrefixApplied| Whether the payload in this entry is using prefixes for
	// each attribute. This happens when this entry is the result of a relation
	// join.
	constructor(readonly row: Row, private readonly isPrefixApplied: boolean) {
		this.id = RelationEntry.getNextId();
	}

	getField(col: Column): unknown {
		// Attempting to get the field from the aliased location first, since it is
		// not guaranteed that setField() has been called for this instance. If not
		// found then look for it in its normal location.
		const column = col as BaseColumn;
		const alias = column.getAlias();
		if (
			alias !== null
			&& Object.prototype.hasOwnProperty.call(this.row.payload(), alias)
		) {
			return this.row.payload()[alias];
		}

		if (this.isPrefixApplied) {
			return this.row.payload()[
				(column.getTable() as BaseTable).getEffectiveName()
			][column.getName()];
		} else {
			return this.row.payload()[column.getName()];
		}
	}

	setField(col: Column, value: unknown): void {
		const column = col as BaseColumn;
		const alias = column.getAlias();
		if (alias !== null) {
			this.row.payload()[alias] = value;
			return;
		}

		if (this.isPrefixApplied) {
			const tableName = (column.getTable() as BaseTable).getEffectiveName();
			let containerObj = this.row.payload()[tableName];
			if (!(containerObj !== undefined && containerObj !== null)) {
				containerObj = {};
				this.row.payload()[tableName] = containerObj;
			}
			containerObj[column.getName()] = value;
		} else {
			this.row.payload()[column.getName()] = value;
		}
	}
}

type AggregationResult = Relation | number | string;

class Relation {
	// Creates an empty Relation instance. Since a relation is immutable, a
	// singleton "empty" relation instance is lazily instantiated and returned in
	// all subsequent calls.
	static createEmpty(): Relation {
		if (Relation.emptyRelation === null) {
			Relation.emptyRelation = new Relation([], []);
		}
		return Relation.emptyRelation;
	}

	// Finds the intersection of a given list of relations.
	static intersect(relations: Relation[]): Relation {
		if (relations.length === 0) {
			return Relation.createEmpty();
		}

		const totalCount = relations.reduce((soFar, relation) => {
			Relation.assertCompatible(relations[0], relation);
			return soFar + relation.entries.length;
		}, 0);
		const allEntries = new Array<RelationEntry>(totalCount);
		let entryCounter = 0;

		// Creating a map [entry.id --> entry] for each relation, and at the same
		// time populating the allEntries array.
		const relationMaps = relations.map((relation) => {
			const map = new Map<number, RelationEntry>();
			relation.entries.forEach((entry) => {
				allEntries[entryCounter++] = entry;
				map.set(entry.id, entry);
			});
			return map;
		});

		const intersection = new Map<number, RelationEntry>();
		allEntries.forEach((entry) => {
			const existsInAll = relationMaps.every((relation) => relation.has(entry.id));
			if (existsInAll) {
				intersection.set(entry.id, entry);
			}
		});

		return new Relation(Array.from(intersection.values()), Array.from(relations[0].tables.values()));
	}

	// Finds the union of a given list of relations.
	static union(relations: Relation[]): Relation {
		if (relations.length === 0) {
			return Relation.createEmpty();
		}

		const union = new Map<number, RelationEntry>();
		relations.forEach((relation) => {
			Relation.assertCompatible(relations[0], relation);
			relation.entries.forEach((entry) => union.set(entry.id, entry));
		});

		return new Relation(Array.from(union.values()), Array.from(relations[0].tables.values()));
	}

	// Creates an lf.proc.Relation instance from a set of lf.Row instances.
	static fromRows(rows: Row[], tables: string[]): Relation {
		const isPrefixApplied = tables.length > 1;
		const entries = rows.map((row) => new RelationEntry(row, isPrefixApplied));
		return new Relation(entries, tables);
	}

	private static emptyRelation: Relation = null as unknown as Relation;

	// Asserts that two relations are compatible with regards to
	// union/intersection operations.
	private static assertCompatible(lhs: Relation, rhs: Relation): void {
		assert(lhs.isCompatible(rhs), "Intersection/union operations only apply to compatible relations.");
	}

	private readonly tables: Set<string>;

	// A map holding any aggregations that have been calculated for this relation.
	// Null if no aggregations have been calculated. The keys of the map
	// correspond to the normalized name of the aggregated column, for example
	// 'COUNT(*)' or 'MIN(Employee.salary)'.
	private aggregationResults: Map<string, AggregationResult>;

	constructor(readonly entries: RelationEntry[], tables: string[]) {
		this.tables = new Set(tables);
		this.aggregationResults = null as unknown as Map<string, AggregationResult>;
	}

	// Whether this is compatible with given relation in terms of calculating
	// union/intersection.
	isCompatible(relation: Relation): boolean {
		return setEquals(this.tables, relation.tables);
	}

	// Returns the names of all source tables of this relation.
	getTables(): string[] {
		return Array.from(this.tables.values());
	}

	// Whether prefixes have been applied to the payloads in this relation.
	isPrefixApplied(): boolean {
		return this.tables.size > 1;
	}

	getPayloads(): object[] {
		return this.entries.map((entry) => entry.row.payload());
	}

	getRowIds(): number[] {
		return this.entries.map((entry) => entry.row.id());
	}

	// Adds an aggregated result to this relation.
	setAggregationResult(column: Column, result: AggregationResult): void {
		if (this.aggregationResults === null) {
			this.aggregationResults = new Map<string, AggregationResult>();
		}
		this.aggregationResults.set(column.getNormalizedName(), result);
	}

	// Gets an already calculated aggregated result for this relation.
	getAggregationResult(column: Column): AggregationResult {
		assert(this.aggregationResults !== null, "getAggregationResult called before any results have been calculated.");

		const colName = column.getNormalizedName();
		const result = this.aggregationResults.get(colName);
		assert(result !== undefined, `Could not find result for ${colName}`);
		return result;
	}

	// Whether an aggregation result for the given aggregated column has been
	// calculated.
	hasAggregationResult(column: Column): boolean {
		return (
			this.aggregationResults !== null
			&& this.aggregationResults.has(column.getNormalizedName())
		);
	}
}

class TreeNode {
	private static readonly EMPTY_ARRAY: TreeNode[] = [];

	parent: TreeNode | null;

	private children: TreeNode[] | null;

	constructor() {
		this.parent = null;
		this.children = null;
	}

	getParent(): TreeNode {
		return this.parent;
	}

	getRoot(): TreeNode {
		let root: TreeNode = this;
		while (root.parent !== null) {
			root = root.parent;
		}
		return root;
	}

	getDepth(): number {
		let depth = 0;
		let node: TreeNode = this;
		while (node.parent !== null) {
			depth++;
			node = node.parent;
		}
		return depth;
	}

	isLeaf(): boolean {
		return this.children === null;
	}

	getChildren(): TreeNode[] {
		return this.children || TreeNode.EMPTY_ARRAY;
	}

	getChildAt(index: number): TreeNode | null {
		return this.children && index >= 0 && index < this.children.length ? this.getChildren()[index] : null;
	}

	getChildCount(): number {
		return this.getChildren().length;
	}

	addChildAt(child: TreeNode, index: number): void {
		assert(child.parent === null);
		child.parent = this;
		if (this.children === null) {
			// assert(index == 0);
			this.children = [child];
		} else {
			assert(index >= 0 && index <= this.children.length);
			this.children.splice(index, 0, child);
		}
	}

	addChild(child: TreeNode): void {
		assert(child.parent === null);
		child.parent = this;
		if (this.children === null) {
			this.children = [child];
		} else {
			this.children.push(child);
		}
	}

	// Returns removed node at index, if any.
	removeChildAt(index: number): TreeNode | null {
		if (this.children) {
			const child = this.children[index];
			if (child) {
				child.parent = null;
				this.children.splice(index, 1);
				if (this.children.length === 0) {
					this.children = null;
				}
				return child;
			}
		}
		return null;
	}

	// Returns removed node, if any.
	removeChild(child: TreeNode): TreeNode | null {
		return this.children ? this.removeChildAt(this.children.indexOf(child)) : null;
	}

	// Returns original node, if any.
	replaceChildAt(newChild: TreeNode, index: number): TreeNode | null {
		assert(newChild.parent === null);
		if (this.children) {
			const oldChild = this.getChildAt(index);
			if (oldChild) {
				oldChild.parent = null;
				newChild.parent = this;
				this.children[index] = newChild;
				return oldChild;
			}
		}
		return null;
	}

	// Traverses the subtree with the possibility to skip branches. Starts with
	// this node, and visits the descendant nodes depth-first, in preorder.
	traverse(f: (node: TreeNode) => boolean | void): void {
		if (f(this) !== false) {
			this.getChildren().forEach((child) => {
				child.traverse(f);
			});
		}
	}
}

abstract class PredicateNode extends TreeNode implements Predicate {
	// The ID to assign to the next predicate that will be created. Note that
	// predicates are constructed with unique IDs, but when a predicate is cloned
	//  the ID is also purposefully cloned.
	private static nextId = 0;

	private id: number;

	constructor() {
		super();
		this.id = PredicateNode.nextId++;
	}

	abstract eval(relation: Relation): Relation;
	abstract setComplement(isComplement: boolean): void;
	abstract copy(): Predicate;
	abstract getColumns(results?: Column[]): Column[];
	abstract getTables(results?: Set<Table>): Set<Table>;

	setId(id: number): void {
		this.id = id;
	}

	getId(): number {
		return this.id;
	}
}

class ValuePredicate extends PredicateNode {
	// ComparisonFunction is a special type that needs to allow any.
	private readonly evaluatorFn: (l: any, r: any) => boolean;

	private isComplement: boolean;

	private binder: unknown;

	constructor(
		readonly column: Column,
		private value: unknown,
		readonly evaluatorType: EvalType
	) {
		super();
		this.evaluatorFn = EvalRegistry.get().getEvaluator(this.column.getType(), this.evaluatorType);
		this.isComplement = false;
		this.binder = value;
	}

	eval(relation: Relation): Relation {
		this.checkBinding();

		// Ignoring this.evaluatorFn_() for the case of the IN, in favor of a faster
		// evaluation implementation.
		if (this.evaluatorType === EvalType.IN) {
			return this.evalAsIn(relation);
		}

		const entries = relation.entries.filter((entry) => {
			return (
				this.evaluatorFn(entry.getField(this.column), this.value) !== this.isComplement
			);
		});
		return new Relation(entries, relation.getTables());
	}

	setComplement(isComplement: boolean): void {
		this.isComplement = isComplement;
	}

	copy(): Predicate {
		const clone = new ValuePredicate(this.column, this.value, this.evaluatorType);
		clone.binder = this.binder;
		clone.isComplement = this.isComplement;
		clone.setId(this.getId());
		return clone;
	}

	getColumns(results?: Column[]): Column[] {
		if (results) {
			results.push(this.column);
			return results;
		}
		return [this.column];
	}

	getTables(results?: Set<BaseTable>): Set<BaseTable> {
		const tables = results ? results : new Set<BaseTable>();
		tables.add(this.column.getTable() as BaseTable);
		return tables;
	}

	bind(values: unknown[]): void {
		const checkIndexWithinRange = (index: number) => {
			if (values.length <= index) {
				// 510: Cannot bind to given array: out of range.
				throw new Exception(ErrorCode.BIND_ARRAY_OUT_OF_RANGE);
			}
		};

		if (this.binder instanceof Binder) {
			const index = this.binder.index;
			checkIndexWithinRange(index);
			this.value = values[index];
		} else if (Array.isArray(this.binder)) {
			const array = this.binder as unknown[];
			this.value = array.map((val) => {
				if (val instanceof Binder) {
					checkIndexWithinRange(val.index);
					return values[val.index];
				} else {
					return val;
				}
			});
		}
	}

	override toString(): string {
		return (
			"value_pred("
			+ this.column.getNormalizedName()
			+ " "
			+ this.evaluatorType
			+ (this.isComplement ? "(complement)" : "")
			+ " "
			+ this.value
			+ ")"
		);
	}

	// This is used to enable unit test.
	peek(): unknown {
		return this.value;
	}

	// Whether this predicate can be converted to a KeyRange instance.
	isKeyRangeCompatible(): boolean {
		this.checkBinding();
		return (
			this.value !== null
			&& (this.evaluatorType === EvalType.BETWEEN
				|| this.evaluatorType === EvalType.IN
				|| this.evaluatorType === EvalType.EQ
				|| this.evaluatorType === EvalType.GT
				|| this.evaluatorType === EvalType.GTE
				|| this.evaluatorType === EvalType.LT
				|| this.evaluatorType === EvalType.LTE)
		);
	}

	// Converts this predicate to a key range.
	// NOTE: Not all predicates can be converted to a key range, callers must call
	// isKeyRangeCompatible() before calling this method.
	toKeyRange(): SingleKeyRangeSet {
		assert(this.isKeyRangeCompatible(), "Could not convert predicate to key range.");

		let keyRange = null;
		if (this.evaluatorType === EvalType.BETWEEN) {
			const val = this.value as unknown[];
			keyRange = new SingleKeyRange(this.getValueAsKey(val[0]), this.getValueAsKey(val[1]), false, false);
		} else if (this.evaluatorType === EvalType.IN) {
			const val = this.value as unknown[];
			const keyRanges = val.map((v) => SingleKeyRange.only(v as SingleKey));
			return new SingleKeyRangeSet(this.isComplement ? SingleKeyRange.complement(keyRanges) : keyRanges);
		} else {
			const value = this.getValueAsKey(this.value);
			if (this.evaluatorType === EvalType.EQ) {
				keyRange = SingleKeyRange.only(value);
			} else if (this.evaluatorType === EvalType.GTE) {
				keyRange = SingleKeyRange.lowerBound(value);
			} else if (this.evaluatorType === EvalType.GT) {
				keyRange = SingleKeyRange.lowerBound(value, true);
			} else if (this.evaluatorType === EvalType.LTE) {
				keyRange = SingleKeyRange.upperBound(value);
			} else {
				// Must be this.evaluatorType === EvalType.LT.
				keyRange = SingleKeyRange.upperBound(value, true);
			}
		}

		return new SingleKeyRangeSet(this.isComplement ? keyRange.complement() : [keyRange]);
	}

	private checkBinding(): void {
		let bound = false;
		if (!(this.value instanceof Binder)) {
			if (Array.isArray(this.value)) {
				const array = this.value as unknown[];
				bound = !array.some((val) => val instanceof Binder);
			} else {
				bound = true;
			}
		}
		if (!bound) {
			// 501: Value is not bounded.
			throw new Exception(ErrorCode.UNBOUND_VALUE);
		}
	}

	private evalAsIn(relation: Relation): Relation {
		assert(this.evaluatorType === EvalType.IN, "ValuePredicate#evalAsIn_() called for wrong predicate type.");

		const valueSet = new Set<unknown>(this.value as unknown[]);
		const evaluatorFn = (rowValue: unknown) => {
			return rowValue === null ? false : valueSet.has(rowValue) !== this.isComplement;
		};
		const entries = relation.entries.filter((entry) => evaluatorFn(entry.getField(this.column)));
		return new Relation(entries, relation.getTables());
	}

	// Converts value in this predicate to index key.
	private getValueAsKey(value: unknown): SingleKey {
		if (this.column.getType() === Type.DATE_TIME) {
			return (value as Date).getTime();
		}
		return value as SingleKey;
	}
}

// Base context for all query types.
abstract class Context extends UniqueId {
	// Creates predicateMap such that predicates can be located by ID.
	private static buildPredicateMap(rootPredicate: PredicateNode): Map<number, Predicate> {
		const predicateMap = new Map<number, Predicate>();
		rootPredicate.traverse((n) => {
			const node = n as PredicateNode as Predicate;
			predicateMap.set(node.getId(), node);
		});
		return predicateMap;
	}

	where: Predicate | null;

	clonedFrom: Context | null;

	// A map used for locating predicates by ID. Instantiated lazily.
	private predicateMap: Map<number, Predicate>;

	constructor() {
		super();
		this.clonedFrom = null;
		this.where = null;
		this.predicateMap = null as unknown as Map<number, Predicate>;
	}

	getPredicate(id: number): Predicate {
		if (this.predicateMap === null && this.where !== null) {
			this.predicateMap = Context.buildPredicateMap(this.where as PredicateNode);
		}
		const predicate: Predicate = this.predicateMap.get(id);
		assert(predicate !== undefined);
		return predicate;
	}

	bind(values: unknown[]): this {
		assert(this.clonedFrom === null);
		return this;
	}

	bindValuesInSearchCondition(values: unknown[]): void {
		const searchCondition: PredicateNode = this.where as PredicateNode;
		if (searchCondition !== null) {
			searchCondition.traverse((node) => {
				if (node instanceof ValuePredicate) {
					node.bind(values);
				}
			});
		}
	}

	abstract getScope(): Set<Table>;
	abstract clone(): Context;

	protected cloneBase(context: Context): void {
		if (context.where) {
			this.where = context.where.copy();
		}
		this.clonedFrom = context;
	}
}

interface SelectContextOrderBy {
	column: Column;
	order: Order;
}

// Internal representation of SELECT query.
class SelectContext extends Context {
	static orderByToString(orderBy: SelectContextOrderBy[]): string {
		let out = "";
		orderBy.forEach((orderByEl, index) => {
			out += orderByEl.column.getNormalizedName() + " ";
			out += orderByEl.order === Order.ASC ? "ASC" : "DESC";
			if (index < orderBy.length - 1) {
				out += ", ";
			}
		});

		return out;
	}

	columns!: Column[];

	from!: Table[];

	limit!: number;

	skip!: number;

	orderBy!: SelectContextOrderBy[];

	groupBy!: Column[];

	limitBinder!: Binder;

	skipBinder!: Binder;

	outerJoinPredicates!: Set<number>;

	constructor() {
		super();
	}

	getScope(): Set<Table> {
		return new Set<Table>(this.from);
	}

	clone(): SelectContext {
		const context = new SelectContext();
		context.cloneBase(this);
		if (this.columns) {
			context.columns = this.columns.slice();
		}
		if (this.from) {
			context.from = this.from.slice();
		}
		context.limit = this.limit;
		context.skip = this.skip;
		if (this.orderBy) {
			context.orderBy = this.orderBy.slice();
		}
		if (this.groupBy) {
			context.groupBy = this.groupBy.slice();
		}
		if (this.limitBinder) {
			context.limitBinder = this.limitBinder;
		}
		if (this.skipBinder) {
			context.skipBinder = this.skipBinder;
		}
		context.outerJoinPredicates = this.outerJoinPredicates;
		return context;
	}

	override bind(values: unknown[]): this {
		super.bind(values);

		if (this.limitBinder !== undefined && this.limitBinder !== null) {
			this.limit = values[this.limitBinder.index] as number;
		}
		if (this.skipBinder !== undefined && this.skipBinder !== null) {
			this.skip = values[this.skipBinder.index] as number;
		}
		this.bindValuesInSearchCondition(values);
		return this;
	}
}

class PhysicalQueryPlan {
	// Calculates the combined scope of the given list of physical query plans.
	static getCombinedScope(plans: PhysicalQueryPlan[]): Set<Table> {
		const tableSet = new Set<Table>();
		plans.forEach((plan) => {
			plan.getScope().forEach(tableSet.add.bind(tableSet));
		});
		return tableSet;
	}

	constructor(
		private readonly rootNode: PhysicalQueryPlanNode,
		private readonly scope: Set<Table>
	) { }

	getRoot(): PhysicalQueryPlanNode {
		return this.rootNode;
	}

	// Returns scope of this plan (i.e. tables involved)
	getScope(): Set<Table> {
		return this.scope;
	}
}

interface Task {
	exec: () => Promise<Relation[]>;
	getType: () => TransactionType;

	// Returns the tables that this task refers to.
	getScope: () => Set<Table>;
	getResolver: () => Resolver<Relation[]>;

	// Returns a unique number for this task.
	getId: () => number;

	// Returns the priority of this task.
	getPriority: () => TaskPriority;
}

interface TaskItem {
	context: Context;
	plan: PhysicalQueryPlan;
}

// A QueryTask represents a collection of queries that should be executed as
// part of a single transaction.
abstract class QueryTask extends UniqueId implements Task {
	protected queries: Context[];

	private readonly plans: PhysicalQueryPlan[];

	private readonly combinedScope: Set<Table>;

	private readonly txType: TransactionType;

	private readonly resolver: Resolver<Relation[]>;

	private tx!: Tx;

	constructor(
		protected backStore: BackStore,
		protected schema: Schema,
		protected cache: Cache,
		protected indexStore: IndexStore,
		items: TaskItem[]
	) {
		super();
		this.queries = items.map((item) => item.context);
		this.plans = items.map((item) => item.plan);
		this.combinedScope = PhysicalQueryPlan.getCombinedScope(this.plans);
		this.txType = this.detectType();
		this.resolver = new Resolver<Relation[]>();
	}

	exec(): Promise<Relation[]> {
		const journal = this.txType === TransactionType.READ_ONLY ? undefined : new Journal(this.schema, this.cache, this.indexStore, this.combinedScope);
		const results: Relation[] = [];

		const remainingPlans = this.plans.slice();
		const queries = this.queries;

		const sequentiallyExec = (): Promise<Relation[]> => {
			const plan = remainingPlans.shift();
			if (plan) {
				const queryContext = queries[results.length];
				return plan
					.getRoot()
					.exec(journal, queryContext)
					.then((relations) => {
						results.push(relations[0]);
						return sequentiallyExec();
					});
			}
			return Promise.resolve(results);
		};

		return sequentiallyExec()
			.then(() => {
				this.tx = this.backStore.createTx(this.txType, Array.from(this.combinedScope.values() as unknown as BaseTable[]), journal);
				return this.tx.commit();
			})
			.then(() => {
				this.onSuccess(results);
				return results;
			}, (e) => {
				if (journal) {
					journal.rollback();
				}
				throw e;
			});
	}

	getType(): TransactionType {
		return this.txType;
	}

	getScope(): Set<Table> {
		return this.combinedScope;
	}

	getResolver(): Resolver<Relation[]> {
		return this.resolver;
	}

	getId(): number {
		return this.getUniqueNumber();
	}

	abstract getPriority(): TaskPriority;

	// Returns stats for the task. Used in transaction.exec([queries]).
	stats(): TransactionStatsImpl {
		let results: TransactionStatsImpl | null = null;
		if (this.tx) {
			results = this.tx.stats() as TransactionStatsImpl;
		}
		return results === null ? TransactionStatsImpl.getDefault() : results;
	}

	// Executes after all queries have finished successfully. Default
	// implementation is a no-op. Subclasses should override this method as
	// necessary.
	protected onSuccess(results: Relation[]): void {
		// Default implementation is a no-op.
	}

	private detectType(): TransactionType {
		return this.queries.some((query) => !(query instanceof SelectContext)) ? TransactionType.READ_WRITE : TransactionType.READ_ONLY;
	}
}

class MemoryTable implements RuntimeTable {
	private readonly data: Map<number, Row>;

	constructor() {
		this.data = new Map();
	}

	getSync(ids: number[]): Row[] {
		// Empty array is treated as "return all rows".
		if (ids.length === 0) {
			return Array.from(this.data.values());
		}

		const results: Row[] = [];
		ids.forEach((id) => {
			const row = this.data.get(id) || null;
			if (row !== null) {
				results.push(row);
			}
		}, this);

		return results;
	}

	get(ids: number[]): Promise<Row[]> {
		return Promise.resolve(this.getSync(ids));
	}

	putSync(rows: Row[]): void {
		rows.forEach((row) => this.data.set(row.id(), row));
	}

	put(rows: Row[]): Promise<void> {
		this.putSync(rows);
		return Promise.resolve();
	}

	removeSync(ids: number[]): void {
		if (ids.length === 0 || ids.length === this.data.size) {
			// Remove all.
			this.data.clear();
		} else {
			ids.forEach((id) => this.data.delete(id));
		}
	}

	remove(ids: number[]): Promise<void> {
		this.removeSync(ids);
		return Promise.resolve();
	}
}

// A base class for all native DB transactions wrappers to subclass.
abstract class BaseTx implements Tx {
	protected resolver: Resolver<unknown>;

	private readonly journal: Journal | null;

	private success: boolean;

	private statsObject: TransactionStatsImpl | null;

	constructor(protected txType: TransactionType, journal?: Journal) {
		this.journal = journal || null;
		this.resolver = new Resolver<unknown>();
		this.success = false;
		this.statsObject = null;
	}

	abstract getTable(
		tableName: string,
		deserializeFn: (value: RawRow) => Row,
		tableType?: TableType
	): RuntimeTable;
	abstract abort(): void;
	abstract commitInternal(): Promise<unknown>;

	getJournal(): Journal | null {
		return this.journal;
	}

	commit(): Promise<unknown> {
		const promise = this.txType === TransactionType.READ_ONLY ? this.commitInternal() : this.commitReadWrite();
		return promise.then((results: unknown) => {
			this.success = true;
			return results;
		});
	}

	stats(): TransactionStatsImpl | null {
		if (this.statsObject === null) {
			if (!this.success) {
				this.statsObject = TransactionStatsImpl.getDefault();
			} else if (this.txType === TransactionType.READ_ONLY) {
				this.statsObject = new TransactionStatsImpl(true, 0, 0, 0, 0);
			} else {
				const diff = this.journal.getDiff();
				let insertedRows = 0;
				let deletedRows = 0;
				let updatedRows = 0;
				let tablesChanged = 0;
				diff.forEach((tableDiff) => {
					tablesChanged++;
					insertedRows += tableDiff.getAdded().size;
					updatedRows += tableDiff.getModified().size;
					deletedRows += tableDiff.getDeleted().size;
				});
				this.statsObject = new TransactionStatsImpl(true, insertedRows, updatedRows, deletedRows, tablesChanged);
			}
		}
		return this.statsObject;
	}

	private commitReadWrite(): Promise<unknown> {
		return this.mergeIntoBackstore().then((results) => {
			this.journal.commit();
			return results;
		});
	}

	// Flushes all changes currently in this transaction's journal to the backing
	// store. Returns a promise firing after all changes have been successfully
	// written to the backing store.
	private mergeIntoBackstore(): Promise<unknown> {
		this.mergeTableChanges();
		this.mergeIndexChanges();

		// When all DB operations have finished, this.whenFinished will fire.
		return this.commitInternal();
	}

	// Flushes the changes currently in this transaction's journal that refer to
	// user-defined tables to the backing store.
	private mergeTableChanges(): void {
		const journal = this.journal;
		const diff = journal.getDiff();
		diff.forEach((tableDiff, tableName) => {
			const tableSchema = journal.getScope().get(tableName) as BaseTable;
			const table = this.getTable(tableSchema.getName(), tableSchema.deserializeRow.bind(tableSchema), TableType.DATA);
			const toDeleteRowIds = Array.from(tableDiff.getDeleted().values()).map((row) => row.id());
			const toPut = Array.from(tableDiff.getModified().values())
				.map((modification) => modification[1])
				.concat(Array.from(tableDiff.getAdded().values()));
			// If we have things to put and delete in the same transaction then we
			// need to disable the clear table optimization the backing store might
			// want to do. Otherwise we have possible races between the put and
			// count/clear.
			const shouldDisableClearTableOptimization = toPut.length > 0;
			if (toDeleteRowIds.length > 0) {
				table.remove(toDeleteRowIds, shouldDisableClearTableOptimization).then(() => { }, (e: Error) => {
					this.resolver.reject(e);
				});
			}
			table.put(toPut).then(() => { }, (e: Error) => {
				this.resolver.reject(e);
			});
		}, this);
	}

	// Flushes the changes currently in this transaction's journal that refer to
	// persisted indices to the backing store.
	private mergeIndexChanges(): void {
		const indices = this.journal.getIndexDiff();
		indices.forEach((index) => {
			const indexTable = this.getTable(index.getName(), Row.deserialize, TableType.INDEX);
			// Since there is no index diff implemented yet, the entire index needs
			// to be overwritten on disk.
			indexTable.remove([]);
			indexTable.put(index.serialize());
		}, this);
	}
}

class MemoryTx extends BaseTx {
	constructor(
		private readonly store: Memory,
		type: TransactionType,
		journal?: Journal
	) {
		super(type, journal);
		if (type === TransactionType.READ_ONLY) {
			this.resolver.resolve();
		}
	}

	getTable(
		tableName: string,
		deserializeFn: (value: RawRow) => Row,
		tableType?: TableType
	): RuntimeTable {
		return this.store.getTableInternal(tableName);
	}

	abort(): void {
		this.resolver.reject();
	}

	commitInternal(): Promise<unknown> {
		this.resolver.resolve();
		return this.resolver.promise;
	}
}

class Memory implements BackStore {
	private readonly tables: Map<string, MemoryTable>;

	constructor(private readonly schema: Schema) {
		this.tables = new Map<string, MemoryTable>();

		(this.schema.tables() as BaseTable[]).forEach((table) => {
			this.initTable(table);
		}, this);
	}

	getTableInternal(tableName: string): RuntimeTable {
		const table = this.tables.get(tableName) || null;
		if (table === null) {
			// 101: Table {0} not found.
			throw new Exception(ErrorCode.TABLE_NOT_FOUND, tableName);
		}
		return table;
	}

	createTx(type: TransactionType, scope: BaseTable[], journal?: Journal): Tx {
		return new MemoryTx(this, type, journal);
	}

	close(): void {
		// No op.
	}

	supportsImport(): boolean {
		return true;
	}

	peek(): Map<string, MemoryTable> {
		return this.tables;
	}

	// Creates a new empty table in the database. It is a no-op if a table with
	// the given name already exists.
	// NOTE: the return value is not ported because it's not used.
	private createTable(tableName: string): void {
		if (!this.tables.has(tableName)) {
			this.tables.set(tableName, new MemoryTable());
		}
	}

	private initTable(tableSchema: BaseTable): void {
		this.createTable(tableSchema.getName());

		if (tableSchema.persistentIndex()) {
			tableSchema.getIndices().forEach((indexSchema) => {
				this.createTable(indexSchema.getNormalizedName());
			}, this);

			// Creating RowId index table.
			this.createTable(tableSchema.getRowIdIndexName());
		}
	}
}

// Port of goog.math methods used by Lovefield.
class MathHelper {
	static sum(...args: number[]): number {
		return args.reduce((sum, value) => sum + value, 0);
	}

	static average(...args: number[]): number {
		return MathHelper.sum.apply(null, args) / args.length;
	}

	static standardDeviation(...args: number[]): number {
		if (!args || args.length < 2) {
			return 0;
		}

		const mean = MathHelper.average.apply(null, args);
		const sampleVariance = MathHelper.sum.apply(null, args.map((val) => (val - mean) ** 2))
			/ (args.length - 1);
		return Math.sqrt(sampleVariance);
	}
}

interface QueryBuilder {
	// Executes the query, all errors will be passed to the reject function.
	// The resolve function may receive parameters as results of execution, for
	// example, select queries will return results.
	exec: () => Promise<unknown>;

	// Returns string representation of query execution plan. Similar to EXPLAIN
	// in most SQL engines.
	explain: () => string;

	// Bind values to parameterized queries. Callers are responsible to make sure
	// the types of values match those specified in the query.
	bind: (values: unknown[]) => QueryBuilder;

	// |stripValueInfo| true will remove value info to protect PII, default to
	// false in all implementations.
	toSql: (stripValueInfo?: boolean) => string;

	getTaskItem: () => TaskItem;
	assertExecPreconditions: () => void;
}

// Query Builder which constructs a SELECT query. The builder is stateful.
// All member functions, except orderBy(), can only be called once. Otherwise
// an exception will be thrown.
interface SelectQuery extends QueryBuilder {
	// Specifies the source of the SELECT query.
	from: (...tables: string[] | Table[]) => SelectQuery;

	// Defines search condition of the SELECT query.
	where: (predicate: Predicate) => SelectQuery;

	// Explicit inner join target table with specified search condition.
	innerJoin: (table: Table, predicate: Predicate) => SelectQuery;

	// Explicit left outer join target table with specified search condition.
	leftOuterJoin: (table: Table, predicate: Predicate) => SelectQuery;

	// Limits the number of rows returned in select results. If there are fewer
	// rows than limit, all rows will be returned.
	limit: (numberOfRows: Binder | number) => SelectQuery;

	// Skips the number of rows returned in select results from the beginning. If
	// there are fewer rows than skip, no row will be returned.
	skip: (numberOfRows: Binder | number) => SelectQuery;

	// Specify sorting order of returned results.
	orderBy: (column: Column, order?: Order) => SelectQuery;

	// Specify grouping of returned results.
	groupBy: (...columns: Column[]) => SelectQuery;
}

interface Cache {
	// Inserts/Updates contents in cache. This version takes single row.
	set: (tableName: string, row: Row) => void;

	// Inserts/Updates contents in cache. This version takes multiple rows.
	setMany: (tableName: string, rows: Row[]) => void;

	// Returns contents from the cache.
	get: (id: number) => Row | null;

	// Returns contents from the cache.
	getMany: (id: number[]) => (Row | null)[];

	// Returns contents from the cache. The range query will return only the rows
	// with row ids matching the range.
	getRange: (tableName: string, fromId: number, toId: number) => Row[];

	// Removes a single entry from the cache.
	remove: (tableName: string, rowId: number) => void;

	// Removes entries from the cache.
	removeMany: (tableName: string, rowIds: number[]) => void;

	// Number of rows in cache for |tableName|. If |tableName| is omitted, count
	// rows for all tables.
	getCount: (tableName?: string) => number;

	// Removes all contents from the cache.
	clear: () => void;
}

class DefaultCache implements Cache {
	private readonly map: Map<number, Row>;

	private readonly tableRows: Map<string, Set<number>>;

	constructor(schema: Schema) {
		this.map = new Map<number, Row>();
		this.tableRows = new Map<string, Set<number>>();

		schema.tables().forEach((table) => {
			this.tableRows.set(table.getName(), new Set<number>());
		}, this);
	}

	set(tableName: string, row: Row): void {
		this.map.set(row.id(), row);
		this.getTableRowSet(tableName).add(row.id());
	}

	setMany(tableName: string, rows: Row[]): void {
		const tableSet = this.getTableRowSet(tableName);
		rows.forEach((row) => {
			this.map.set(row.id(), row);
			tableSet.add(row.id());
		}, this);
	}

	get(id: number): Row | null {
		return this.map.get(id) || null;
	}

	getMany(ids: number[]): (Row | null)[] {
		return ids.map((id) => this.get(id));
	}

	getRange(tableName: string, fromId: number, toId: number): Row[] {
		const data: Row[] = [];
		const min = Math.min(fromId, toId);
		const max = Math.max(fromId, toId);
		const tableSet = this.getTableRowSet(tableName);

		// Ensure the least number of keys are iterated.
		if (tableSet.size < max - min) {
			tableSet.forEach((key) => {
				if (key >= min && key <= max) {
					const value = this.map.get(key);
					assert(value !== null && value !== undefined, "Inconsistent cache 1");
					data.push(value as unknown as Row);
				}
			}, this);
		} else {
			for (let i = min; i <= max; ++i) {
				if (!tableSet.has(i)) {
					continue;
				}
				const value = this.map.get(i);
				assert(value !== null && value !== undefined, "Inconsistent cache 2");
				data.push(value as unknown as Row);
			}
		}
		return data;
	}

	remove(tableName: string, id: number): void {
		this.map.delete(id);
		this.getTableRowSet(tableName).delete(id);
	}

	removeMany(tableName: string, ids: number[]): void {
		const tableSet = this.getTableRowSet(tableName);
		ids.forEach((id) => {
			this.map.delete(id);
			tableSet.delete(id);
		}, this);
	}

	getCount(tableName?: string): number {
		return tableName ? this.getTableRowSet(tableName).size : this.map.size;
	}

	clear(): void {
		this.map.clear();
		this.tableRows.clear();
	}

	private getTableRowSet(tableName: string): Set<number> {
		const ret = this.tableRows.get(tableName);
		return ret as unknown as Set<number>;
	}
}

class ArrayHelper {
	// Returns true if the value were inserted, false otherwise.
	static binaryInsert<T = number>(
		arr: T[],
		value: T,
		comparator?: (l: T, r: T) => number
	): boolean {
		const index = ArrayHelper.binarySearch(arr, value, comparator);
		if (index < 0) {
			arr.splice(-(index + 1), 0, value);
			return true;
		}
		return false;
	}

	// Returns true if the value were inserted, false otherwise.
	static binaryRemove<T = number>(
		arr: T[],
		value: T,
		comparator?: (l: T, r: T) => number
	): boolean {
		const index = ArrayHelper.binarySearch(arr, value, comparator);
		if (index < 0) {
			return false;
		}

		arr.splice(index, 1);
		return true;
	}

	// Flatten the array.
	static flatten(...arr: unknown[]): unknown[] {
		const CHUNK_SIZE = 8192;

		const result: unknown[] = [];
		arr.forEach((element) => {
			if (Array.isArray(element)) {
				for (let c = 0; c < element.length; c += CHUNK_SIZE) {
					const chunk = element.slice(c, c + CHUNK_SIZE);
					const recurseResult = ArrayHelper.flatten.apply(null, chunk);
					recurseResult.forEach((r: unknown) => result.push(r));
				}
			} else {
				result.push(element);
			}
		});
		return result;
	}

	// Cartesian product of zero or more sets.  Gives an iterator that gives every
	// combination of one element chosen from each set.  For example,
	// ([1, 2], [3, 4]) gives ([1, 3], [1, 4], [2, 3], [2, 4]).
	static product<T>(arrays: T[][]): T[][] {
		const someArrayEmpty = arrays.some((arr) => !arr.length);
		if (someArrayEmpty || arrays.length === 0) {
			return [];
		}

		let indices: number[] | null = new Array<number>(arrays.length);
		indices.fill(0);
		const result = [];
		while (indices !== null) {
			result.push(indices.map((valueIndex, arrayIndex) => arrays[arrayIndex][valueIndex]));

			// Generate the next-largest indices for the next call.
			// Increase the rightmost index. If it goes over, increase the next
			// rightmost (like carry-over addition).
			for (let i = indices.length - 1; i >= 0; i--) {
				// Assertion prevents compiler warning below.
				assert(indices !== null);
				if (indices[i] < arrays[i].length - 1) {
					indices[i]++;
					break;
				}

				// We're at the last indices (the last element of every array), so
				// the iteration is over on the next call.
				if (i === 0) {
					indices = null;
					break;
				}
				// Reset the index in this column and loop back to increment the
				// next one.
				indices[i] = 0;
			}
		}
		return result;
	}

	// Returns lowest index of the target value if found, otherwise
	// (-(insertion point) - 1). The insertion point is where the value should
	// be inserted into arr to preserve the sorted property.  Return value >= 0
	// iff target is found.
	private static binarySearch<T = number>(
		arr: T[],
		value: T,
		comparator?: (l: T, r: T) => number
	): number {
		let left = 0;
		let right = arr.length;
		const comp: (l: T, r: T) => number = comparator
			|| (ArrayHelper.defaultComparator as unknown as (l: T, r: T) => number);
		while (left < right) {
			const middle = left + right >> 1;
			if (comp(arr[middle], value) < 0) {
				left = middle + 1;
			} else {
				right = middle;
			}
		}

		// ~left is a shorthand for -left - 1.
		return left === right && arr[left] === value ? left : ~left;
	}

	// Returns negative value if lhs < rhs, 0 if equal, positive value if
	// lhs > rhs.
	private static defaultComparator(lhs: number, rhs: number): number {
		return lhs - rhs;
	}
}

// Helper functions for index structures.
class IndexHelper {
	// Slice result array by limit and skip.
	// Note: For performance reasons the input array might be modified in place.
	static slice(
		rawArray: number[],
		reverseOrder?: boolean,
		limit?: number,
		skip?: number
	): number[] {
		const array = reverseOrder ? rawArray.reverse() : rawArray;

		// First handling case where no limit and no skip parameters have been
		// specified, such that no copying of the input array is performed. This is
		// an optimization such that unnecessary copying can be avoided for the
		// majority case (no limit/skip params).
		if (
			(limit === undefined || limit === null)
			&& (skip === undefined || skip === null)
		) {
			return array;
		}

		// Handling case where at least one of limit/skip parameters has been
		// specified. The input array will have to be sliced.
		const actualLimit = Math.min(limit !== undefined ? limit : array.length, array.length);
		if (actualLimit === 0) {
			return [];
		}

		const actualSkip = Math.min(skip || 0, array.length);

		return array.slice(actualSkip, actualSkip + actualLimit);
	}
}

class IndexStats {
	totalRows: number;

	// Useful only for primary key auto-increment indices. Ensures that previously
	// encountered IDs within the same session (application run) are not re-used,
	// even after they have been freed.
	maxKeyEncountered: Key | null;

	constructor() {
		this.totalRows = 0;
		this.maxKeyEncountered = 0;
	}

	// Signals that a row had been added to index.
	add(key: Key, rowCount: number): void {
		this.totalRows += rowCount;

		this.maxKeyEncountered = this.maxKeyEncountered === null ? key : key > this.maxKeyEncountered ? key : this.maxKeyEncountered;
	}

	// Signals that row(s) had been removed from index.
	remove(key: Key, removedCount: number): void {
		this.totalRows -= removedCount;
	}

	// Signals that the index had been cleared.
	clear(): void {
		this.totalRows = 0;
		// this.maxKeyEncountered shall not be updated.
	}

	// Combines stats given and put the results into current object.
	updateFromList(statsList: IndexStats[]): void {
		this.clear();
		statsList.forEach((stats) => this.totalRows += stats.totalRows);
	}
}

interface BTreeNodePayload {
	key: Key;
	value: number;
}

// Wrapper of the BTree.
class BTree implements RuntimeIndex {
	static EMPTY: number[] = [];

	private root: BTreeNode;

	private readonly statsObj: IndexStats;

	constructor(
		private readonly name: string,
		private readonly comparatorObj: Comparator,
		private readonly uniqueKeyOnly: boolean,
		data?: BTreeNodePayload[]
	) {
		this.root = undefined as unknown as BTreeNode;
		this.statsObj = new IndexStats();
		if (data) {
			this.root = BTreeNode.fromData(this, data);
		} else {
			this.clear();
		}
	}

	getName(): string {
		return this.name;
	}

	toString(): string {
		return this.root.toString();
	}

	add(key: Key, value: number): void {
		this.root = this.root.insert(key, value);
	}

	set(key: Key, value: number): void {
		this.root = this.root.insert(key, value, true);
	}

	remove(key: Key, rowId?: number): void {
		this.root = this.root.remove(key, rowId);
	}

	get(key: Key): number[] {
		return this.root.get(key);
	}

	cost(keyRange?: KeyRange | SingleKeyRange): number {
		if (keyRange === undefined || keyRange === null) {
			return this.stats().totalRows;
		}

		if (keyRange instanceof SingleKeyRange) {
			if (keyRange.isAll()) {
				return this.stats().totalRows;
			}
			if (keyRange.isOnly()) {
				// TODO(arthurhsu): this shall be further optimized
				return this.get(keyRange.from as Key).length;
			}
		}

		// TODO(arthurhsu): implement better cost calculation for ranges.
		return this.getRange([keyRange] as KeyRange).length;
	}

	stats(): IndexStats {
		return this.statsObj;
	}

	getRange(
		keyRanges?: KeyRange[] | SingleKeyRange[],
		reverseOrder?: boolean,
		rawLimit?: number,
		rawSkip?: number
	): number[] {
		const leftMostKey = this.root.getLeftMostNode().keys[0];
		if (leftMostKey === undefined || rawLimit === 0) {
			// Tree is empty or fake fetch to make query plan cached.
			return BTree.EMPTY;
		}

		const reverse = reverseOrder || false;
		const limit = rawLimit !== undefined && rawLimit !== null ? Math.min(rawLimit, this.stats().totalRows) : this.stats().totalRows;
		const skip = rawSkip || 0;
		const maxCount = Math.min(Math.max(this.stats().totalRows - skip, 0), limit);
		if (maxCount === 0) {
			return BTree.EMPTY;
		}

		if (
			keyRanges === undefined
			|| keyRanges.length === 1
			&& keyRanges[0] instanceof SingleKeyRange
			&& keyRanges[0].isAll()
		) {
			return this.getAll(maxCount, reverse, limit, skip);
		}

		const sortedKeyRanges = this.comparator().sortKeyRanges(keyRanges);
		// TODO(arthurhsu): Currently we did not traverse in reverse order so that
		//     the results array needs to be maxCount. Need further optimization.
		const results = new Array<number>(reverse ? this.stats().totalRows : maxCount);
		const params = {
			"count": 0,
			"limit": results.length,
			"reverse": reverse,
			"skip": skip
		};

		// For all cross-column indices, use filter to handle non-continuous blocks.
		const useFilter = this.comparator().keyDimensions() > 1;
		sortedKeyRanges.forEach((range) => {
			const keys = this.comparator().rangeToKeys(range);
			const key = this.comparator().isLeftOpen(range) ? leftMostKey : keys[0];
			let start = this.root.getContainingLeaf(key);
			// Need to have two strikes to stop.
			// Reason: say the nodes are [12, 15], [16, 18], when look for >15,
			//         first node will return empty, but we shall not stop there.
			let strikeCount = 0;
			while (
				start !== undefined
				&& start !== null
				&& params.count < params.limit
			) {
				if (useFilter) {
					start.getRangeWithFilter(range, params, results);
				} else {
					start.getRange(range, params, results);
				}
				if (
					params.skip === 0
					&& !start.isFirstKeyInRange(range as SingleKeyRange[])
				) {
					strikeCount++;
				} else {
					strikeCount = 0;
				}
				start = strikeCount === 2 ? null : start.next;
			}
		}, this);

		if (results.length > params.count) {
			// There are extra elements in results, truncate them.
			results.splice(params.count, results.length - params.count);
		}
		return reverse ? IndexHelper.slice(results, reverse, limit, skip) : results;
	}

	clear(): void {
		this.root = BTreeNode.create(this);
		this.stats().clear();
	}

	containsKey(key: Key | SingleKey): boolean {
		return this.root.containsKey(key);
	}

	min(): unknown[] | null {
		return this.minMax(this.comparatorObj.min.bind(this.comparatorObj));
	}

	max(): unknown[] | null {
		return this.minMax(this.comparatorObj.max.bind(this.comparatorObj));
	}

	isUniqueKey(): boolean {
		return this.uniqueKeyOnly;
	}

	comparator(): Comparator {
		return this.comparatorObj;
	}

	eq(lhs: Key | SingleKey, rhs: Key | SingleKey): boolean {
		if (lhs !== undefined && lhs !== null) {
			return this.comparator().compare(lhs, rhs) === Favor.TIE;
		}
		return false;
	}

	// Converts the tree leaves into serializable rows that can be written into
	// persistent stores. Each leaf node is one row.
	serialize(): Row[] {
		return BTreeNode.serialize(this.root.getLeftMostNode());
	}

	// Special optimization for get all values.
	// |maxCount|: max possible number of rows
	// |reverse|: retrieve the results in the reverse ordering of the comparator.
	private getAll(
		maxCount: number,
		reverse: boolean,
		limit: number,
		skip: number
	): number[] {
		const off = reverse ? this.stats().totalRows - maxCount - skip : skip;

		const results = new Array<number>(maxCount);
		const params = {
			"count": maxCount,
			"offset": off,
			"startIndex": 0
		};
		this.root.fill(params, results);
		return reverse ? results.reverse() : results;
	}

	// If the first dimension of key is null, returns null, otherwise returns the
	// results for min()/max().
	private checkNullKey(node: BTreeNode, index: number): [Key, unknown] | null {
		if (!this.comparator().comparable(node.keys[index])) {
			if (Array.isArray(node.keys[index])) {
				if ((node.keys[index] as Key[])[0] === null) {
					return null;
				}
			} else {
				return null;
			}
		}
		return [
			node.keys[index],
			this.uniqueKeyOnly ? [node.values[index]] : node.values[index]
		];
	}

	private findLeftMost(): [Key, unknown] | null {
		let node: BTreeNode | null = this.root.getLeftMostNode();
		let index = 0;
		do {
			if (index >= node.keys.length) {
				node = node.next;
				index = 0;
				continue;
			}

			const results = this.checkNullKey(node, index);
			if (results !== null) {
				return results;
			}

			index++;
		} while (node !== null);
		return null;
	}

	private findRightMost(): [Key, unknown] | null {
		let node: BTreeNode | null = this.root.getRightMostNode();
		let index = node.keys.length - 1;
		do {
			if (index < 0) {
				node = node.prev;
				index = 0;
				continue;
			}

			const results = this.checkNullKey(node, index);
			if (results !== null) {
				return results;
			}

			index--;
		} while (node !== null);
		return null;
	}

	private minMax(compareFn: (l: Key, r: Key) => Favor): unknown[] | null {
		const leftMost = this.findLeftMost();
		const rightMost = this.findRightMost();

		if (leftMost === null || rightMost === null) {
			return null;
		}

		return compareFn(leftMost[0], rightMost[0]) === Favor.LHS ? leftMost : rightMost;
	}
}

interface BTreeNodeRangeParam {
	count: number;
	limit: number;
	reverse: boolean;
	skip: number;
}

interface BTreeNodeFillParam {
	offset: number;
	count: number;
	startIndex: number;
}

class BTreeNode {
	static create(tree: BTree): BTreeNode {
		// TODO(arthurhsu): Should distinguish internal nodes from leaf nodes to
		// avoid unnecessary row id wasting.
		return new BTreeNode(Row.getNextId(), tree);
	}

	static serialize(start: BTreeNode): Row[] {
		const rows: Row[] = [];
		let node: BTreeNode | null = start;
		while (node) {
			const payload = {
				"k": node.keys,
				"v": node.values
			};
			rows.push(new Row(node.id, payload));
			node = node.next;
		}
		return rows;
	}

	// Create B-Tree from sorted array of key-value pairs
	static fromData(tree: BTree, data: BTreeNodePayload[]): BTreeNode {
		let max = BTreeNode.MAX_KEY_LEN;
		max = max * max * max;
		if (data.length >= max) {
			// Tree has more than three levels, need to use a bigger N!
			// 6: Too many rows: B-Tree implementation supports at most {0} rows.
			throw new Exception(ErrorCode.TOO_MANY_ROWS, max.toString());
		}
		let node = BTreeNode.createLeaves(tree, data);
		node = BTreeNode.createInternals(node);
		return node;
	}

	// Maximum number of children a node can have (i.e. order of the B-Tree,
	// denoted as N in the following comments). This number must be greater or
	// equals to 4 for the implemented deletion algorithm to function correctly.
	private static readonly MAX_COUNT = 512;

	private static readonly MAX_KEY_LEN = BTreeNode.MAX_COUNT - 1;

	private static readonly MIN_KEY_LEN = BTreeNode.MAX_COUNT >> 1;

	// Dump the contents of node of the same depth.
	// |node| is the left-most in the level.
	// Returns key and contents string in pair.
	private static dumpLevel(node: BTreeNode): string[] {
		let key = `${node.id}[${node.keys.join("|")}]`;
		const children = node.children.map((n) => n.id).join("|");
		const values = node.values.join("/");
		const getNodeId = (n: BTreeNode | null) => {
			return n !== null && n !== undefined ? n.id.toString() : "_";
		};

		let contents = getNodeId(node.prev) + "{";
		contents += node.isLeaf() ? values : children;
		contents = contents + "}" + getNodeId(node.parent);
		if (node.next) {
			const next = BTreeNode.dumpLevel(node.next);
			key = key + "  " + next[0];
			contents = contents + "  " + next[1];
		}
		return [key, contents];
	}

	private static associate(
		left: BTreeNode | null,
		right: BTreeNode | null
	): void {
		if (right) {
			right.prev = left;
		}
		if (left) {
			left.next = right;
		}
	}

	// Returns appropriate node length for direct construction.
	private static calcNodeLen(remaining: number): number {
		const maxLen = BTreeNode.MAX_KEY_LEN;
		const minLen = BTreeNode.MIN_KEY_LEN + 1;
		return remaining >= maxLen + minLen ? maxLen : remaining >= minLen && remaining <= maxLen ? remaining : minLen;
	}

	// Create leaf nodes from given data.
	private static createLeaves(
		tree: BTree,
		data: BTreeNodePayload[]
	): BTreeNode {
		let remaining = data.length;
		let dataIndex = 0;

		let curNode = BTreeNode.create(tree);
		const node = curNode;
		while (remaining > 0) {
			const nodeLen = BTreeNode.calcNodeLen(remaining);
			const target = data.slice(dataIndex, dataIndex + nodeLen);
			curNode.keys = target.map((e) => e.key);
			curNode.values = target.map((e) => e.value);
			dataIndex += nodeLen;
			remaining -= nodeLen;
			if (remaining > 0) {
				const newNode = BTreeNode.create(curNode.tree);
				BTreeNode.associate(curNode, newNode);
				curNode = newNode;
			}
		}

		return node;
	}

	// Create parent node from children nodes.
	private static createParent(nodes: BTreeNode[]): BTreeNode {
		const node = nodes[0];
		const root = BTreeNode.create(node.tree);
		root.height = node.height + 1;
		root.children = nodes;
		nodes.forEach((n, i) => {
			n.parent = root;
			if (i > 0) {
				root.keys.push(n.keys[0]);
			}
		});
		return root;
	}

	// Create BTree from left-most leaf node.
	private static createInternals(node: BTreeNode): BTreeNode {
		let curNode: BTreeNode | null = node;
		const data = [];
		do {
			data.push(curNode);
			curNode = curNode.next;
		} while (curNode);

		let root;
		if (data.length <= BTreeNode.MAX_KEY_LEN + 1) {
			// Create a root node and return.
			root = BTreeNode.createParent(data);
		} else {
			let remaining = data.length;
			let dataIndex = 0;

			root = BTreeNode.create(node.tree);
			root.height = node.height + 2;
			while (remaining > 0) {
				const nodeLen = BTreeNode.calcNodeLen(remaining);
				const target = data.slice(dataIndex, dataIndex + nodeLen);
				const newNode = BTreeNode.createParent(target);
				newNode.parent = root;
				if (root.children.length) {
					root.keys.push(target[0].keys[0]);
					BTreeNode.associate(root.children[root.children.length - 1], newNode);
				}
				root.children.push(newNode);
				dataIndex += nodeLen;
				remaining -= nodeLen;
			}
		}
		return root;
	}

	// Returns left most key of the subtree.
	private static leftMostKey(node: BTreeNode): Key {
		return node.isLeaf() ? node.keys[0] : BTreeNode.leftMostKey(node.children[0]);
	}

	prev: BTreeNode | null;

	next: BTreeNode | null;

	keys: Key[];

	values: number[] | number[][];

	getContainingLeaf: (key: Key | SingleKey) => BTreeNode | null;

	private height: number;

	private parent: BTreeNode | null;

	private children: BTreeNode[];

	constructor(private readonly id: number, private readonly tree: BTree) {
		this.height = 0;
		this.parent = null;
		this.prev = null;
		this.next = null;
		this.keys = [];
		this.values = [];
		this.children = [];
		this.getContainingLeaf = tree.comparator().keyDimensions() === 1 ? this.getContainingLeafSingleKey : this.getContainingLeafMultiKey;
	}

	// Dump the tree as string. For example, if the tree is
	//
	//                     15
	//          /                      \
	//        9|13                   27|31
	//  /      |       \        /      |      \
	// 1|3  9|10|11  13|14    15|16  27|29  31|38|45
	//
	// and the values of the tree are identical to the keys, then the output will
	// be
	//
	// 11[15]
	// {2|12}
	// 2[9|13]  12[27|31]
	// {0|15|1}11  2{17|5|7}11
	// 0[1|3]  15[9|10|11]  1[13|14]  17[15|16]  5[27|29]  7[31|38|45]
	// {1/3}2  0{9/10/11}2  15{13/14}2  1{15/16}12  17{27/29}12  5{31/38/45}12
	//
	// Each tree level contains two lines, the first line is the key line
	// containing keys of each node in the format of
	// <node_id>[<key0>|<key1>|...|<keyN-1>]. The second line is the value line
	// containing values of each node in the format of
	// <left_node_id>[<value0>|<value1>|...|<valueN>]<parent_node_id>. The root
	// node does not have parent so its parent node id is denoted as underscore.
	//
	// Nodes in each level is a doubly-linked list therefore BFS traversal from
	// left-most to right-most is used. As a result, if the right link is
	// broken, the result will be partial.
	toString(): string {
		let result = "";
		const level = BTreeNode.dumpLevel(this);
		result += level[0] + "\n" + level[1] + "\n";
		if (this.children.length) {
			result += this.children[0].toString();
		}
		return result;
	}

	getLeftMostNode(): BTreeNode {
		return this.isLeaf() ? this : this.children[0].getLeftMostNode();
	}

	getRightMostNode(): BTreeNode {
		return this.isLeaf() ? this : this.children[this.children.length - 1].getRightMostNode();
	}

	get(key: Key | SingleKey): number[] {
		let pos = this.searchKey(key);
		if (this.isLeaf()) {
			let results = BTree.EMPTY;
			if (this.tree.eq(this.keys[pos], key)) {
				// Use concat here because this.values[pos] can be number or array.
				results = results.concat(this.values[pos]);
			}
			return results;
		} else {
			pos = this.tree.eq(this.keys[pos], key) ? pos + 1 : pos;
			return this.children[pos].get(key);
		}
	}

	containsKey(key: Key | SingleKey): boolean {
		const pos = this.searchKey(key);
		if (this.tree.eq(this.keys[pos], key)) {
			return true;
		}

		return this.isLeaf() ? false : this.children[pos].containsKey(key);
	}

	// Deletes a node and returns (new) root node after deletion.
	remove(key: Key | SingleKey, value?: number): BTreeNode {
		this.delete(key, -1, value);

		if (this.isRoot()) {
			let root: BTreeNode | null = this;
			if (this.children.length === 1) {
				root = this.children[0];
				root.parent = null;
			}
			return root;
		}

		return this;
	}

	// Insert node into this subtree. Returns new root if any.
	// |replace| means to replace the value if key existed.
	insert(key: Key | SingleKey, value: number, replace = false): BTreeNode {
		let pos = this.searchKey(key);
		if (this.isLeaf()) {
			if (this.tree.eq(this.keys[pos], key)) {
				if (replace) {
					this.tree
						.stats()
						.remove(key, this.tree.isUniqueKey() ? 1 : (this.values[pos] as number[]).length);
					this.values[pos] = this.tree.isUniqueKey() ? value : [value];
				} else if (this.tree.isUniqueKey()) {
					// 201: Duplicate keys are not allowed.
					throw new Exception(ErrorCode.DUPLICATE_KEYS, this.tree.getName(), JSON.stringify(key));
				} else {
					// Non-unique key that already existed.
					if (!ArrayHelper.binaryInsert(this.values[pos] as number[], value)) {
						// 109: Attempt to insert a row number that already existed.
						throw new Exception(ErrorCode.ROW_ID_EXISTED);
					}
				}
				this.tree.stats().add(key, 1);
				return this;
			}
			this.keys.splice(pos, 0, key);
			(this.values as unknown[]).splice(pos, 0, this.tree.isUniqueKey() ? value : [value]);
			this.tree.stats().add(key, 1);
			return this.keys.length === BTreeNode.MAX_COUNT ? this.splitLeaf() : this;
		} else {
			pos = this.tree.eq(this.keys[pos], key) ? pos + 1 : pos;
			const node = this.children[pos].insert(key, value, replace);
			if (!node.isLeaf() && node.keys.length === 1) {
				// Merge the internal to se
				this.keys.splice(pos, 0, node.keys[0]);
				node.children[1].parent = this;
				node.children[0].parent = this;
				this.children.splice(pos, 1, node.children[1]);
				this.children.splice(pos, 0, node.children[0]);
			}
			return this.keys.length === BTreeNode.MAX_COUNT ? this.splitInternal() : this;
		}
	}

	// The API signature of this function is specially crafted for performance
	// optimization. Perf results showed that creation of empty array erodes the
	// benefit of indexing significantly (in some cases >50%). As a result, it
	// is required to pass in the results array.
	getRange(
		keyRange: KeyRange | SingleKeyRange,
		params: BTreeNodeRangeParam,
		results: number[]
	): void {
		const c = this.tree.comparator();
		let left = 0;
		let right = this.keys.length - 1;

		// Position of range relative to the key.
		const compare = (coverage: boolean[]) => {
			return coverage[0] ? coverage[1] ? Favor.TIE : Favor.LHS : Favor.RHS;
		};

		const keys = this.keys; // Used to avoid binding this for recursive functions.
		const favorLeft = compare(c.compareRange(keys[left], keyRange));
		const favorRight = compare(c.compareRange(keys[right], keyRange));

		// Range is on the left of left most key or right of right most key.
		if (
			favorLeft === Favor.LHS
			|| favorLeft === Favor.RHS && favorRight === Favor.RHS
		) {
			return;
		}

		const getMidPoint = (l: number, r: number): number => {
			const mid = l + r >> 1;
			return mid === l ? mid + 1 : mid;
		};

		// Find the first key that is in range. Returns index of the key, -1 if
		// not found. |favorR| is Favor of right.
		const findFirstKey = (l: number, r: number, favorR: Favor): number => {
			if (l >= r) {
				return favorR === Favor.TIE ? r : -1;
			}
			const favorL = compare(c.compareRange(keys[l], keyRange));
			if (favorL === Favor.TIE) {
				return l;
			} else if (favorL === Favor.LHS) {
				return -1; // Shall not be here.
			}

			const mid = getMidPoint(l, r);
			if (mid === r) {
				return favorR === Favor.TIE ? r : -1;
			}
			const favorM = compare(c.compareRange(keys[mid], keyRange));
			if (favorM === Favor.TIE) {
				return findFirstKey(l, mid, favorM);
			} else if (favorM === Favor.RHS) {
				return findFirstKey(mid + 1, r, favorR);
			} else {
				return findFirstKey(l + 1, mid, favorM);
			}
		};

		// Find the last key that is in range. Returns index of the key, -1 if
		// not found.
		const findLastKey = (l: number, r: number): number => {
			if (l >= r) {
				return l;
			}
			const favorR = compare(c.compareRange(keys[r], keyRange));
			if (favorR === Favor.TIE) {
				return r;
			} else if (favorR === Favor.RHS) {
				return l;
			}

			const mid = getMidPoint(l, r);
			if (mid === r) {
				return l;
			}
			const favorM = compare(c.compareRange(keys[mid], keyRange));
			if (favorM === Favor.TIE) {
				return findLastKey(mid, r);
			} else if (favorM === Favor.LHS) {
				return findLastKey(l, mid - 1);
			} else {
				return -1; // Shall not be here.
			}
		};

		if (favorLeft !== Favor.TIE) {
			left = findFirstKey(left + 1, right, favorRight);
		}
		if (left !== -1) {
			right = findLastKey(left, right);
			if (right !== -1 && right >= left) {
				this.appendResults(params, results, left, right + 1);
			}
		}
	}

	// Loops through all keys and check if key is in the given range. If so push
	// the values into results. This method is slower than the getRange() by
	// design and should be used only in the case of cross-column nullable
	// indices.
	// TODO(arthurhsu): remove this method when GridFile is implemented.
	//
	// |results| can be an empty array, or an array holding any results from
	// previous calls to getRangeWithFilter().
	getRangeWithFilter(
		keyRange: KeyRange | SingleKeyRange,
		params: BTreeNodeRangeParam,
		results: number[]
	): void {
		const c = this.tree.comparator();
		let start = -1;

		// Find initial pos
		for (let i = 0; i < this.keys.length; ++i) {
			if (c.isInRange(this.keys[i], keyRange)) {
				start = i;
				break;
			}
		}

		if (start === -1) {
			return;
		}

		for (
			let i = start;
			i < this.keys.length && params.count < params.limit;
			++i
		) {
			if (!c.isInRange(this.keys[i], keyRange)) {
				continue;
			}
			this.appendResultsAt(params, results, i);
		}
	}

	// Special optimization for appending results. For performance reasons, the
	// parameters of this function are passed by reference.
	// |params| offset means number of rows to skip, count means remaining number
	// of rows to fill, and startIndex is the start index of results for filling.
	fill(params: BTreeNodeFillParam, results: number[]): void {
		if (this.isLeaf()) {
			for (let i = 0; i < this.values.length && params.count > 0; ++i) {
				const val: number[] = this.values[i] as number[];
				if (params.offset > 0) {
					params.offset -= !this.tree.isUniqueKey() ? val.length : 1;
					if (params.offset < 0) {
						for (
							let j = val.length + params.offset;
							j < val.length && params.count > 0;
							++j
						) {
							results[params.startIndex++] = val[j];
							params.count--;
						}
					}
					continue;
				}
				if (this.tree.isUniqueKey()) {
					results[params.startIndex++] = this.values[i] as number;
					params.count--;
				} else {
					for (let j = 0; j < val.length && params.count > 0; ++j) {
						results[params.startIndex++] = val[j];
						params.count--;
					}
				}
			}
		} else {
			for (let i = 0; i < this.children.length && params.count > 0; ++i) {
				this.children[i].fill(params, results);
			}
		}
	}

	isFirstKeyInRange(range: KeyRange): boolean {
		return this.tree.comparator().isFirstKeyInRange(this.keys[0], range);
	}

	private isLeaf(): boolean {
		return this.height === 0;
	}

	private isRoot(): boolean {
		return this.parent === null;
	}

	// Reconstructs internal node keys.
	private fix(): void {
		this.keys = [];
		for (let i = 1; i < this.children.length; ++i) {
			this.keys.push(BTreeNode.leftMostKey(this.children[i]));
		}
	}

	// Deletes a key from a given node. If the key length is smaller than
	// required, execute the following operations according to order:
	// 1. Steal a key from right sibling, if there is one with key > N/2
	// 2. Steal a key from left sibling, if there is one with key > N/2
	// 3. Merge to right sibling, if any
	// 4. Merge to left sibling, if any
	//
	// When stealing and merging happens on internal nodes, the key array of that
	// node will be obsolete and need to be reconstructed by fix().
	//
	// @param {!index.Index.Key} key
	// @param {number} parentPos Position of this node in parent's children.
	// @param {number=} value Match the value to delete.
	// @return {boolean} Whether a fix is needed or not.
	// @private
	private delete(
		key: Key | SingleKey,
		parentPos: number,
		value?: number
	): boolean {
		const pos = this.searchKey(key);
		const isLeaf = this.isLeaf();
		if (!isLeaf) {
			const index = this.tree.eq(this.keys[pos], key) ? pos + 1 : pos;
			if (this.children[index].delete(key, index, value)) {
				this.fix();
			} else {
				return false;
			}
		} else if (!this.tree.eq(this.keys[pos], key)) {
			return false;
		}

		if (this.keys.length > pos && this.tree.eq(this.keys[pos], key)) {
			if (value !== undefined && !this.tree.isUniqueKey() && isLeaf) {
				if (ArrayHelper.binaryRemove(this.values[pos] as number[], value)) {
					this.tree.stats().remove(key, 1);
				}
				const len = (this.values[pos] as number[]).length;
				if (len) {
					return false; // No need to fix.
				}
			}

			this.keys.splice(pos, 1);
			if (isLeaf) {
				const removedLength = this.tree.isUniqueKey() ? 1 : (this.values[pos] as number[]).length;
				this.values.splice(pos, 1);
				this.tree.stats().remove(key, removedLength);
			}
		}

		if (this.keys.length < BTreeNode.MIN_KEY_LEN && !this.isRoot()) {
			if (!this.steal()) {
				this.merge(parentPos);
			}
			return true;
		}

		return true;
	}

	// Steals key from adjacent nodes.
	private steal(): boolean {
		let from: BTreeNode | null = null;
		let fromIndex: number;
		let fromChildIndex: number;
		let toIndex: number;
		if (this.next && this.next.keys.length > BTreeNode.MIN_KEY_LEN) {
			from = this.next;
			fromIndex = 0;
			fromChildIndex = 0;
			toIndex = this.keys.length + 1;
		} else if (this.prev && this.prev.keys.length > BTreeNode.MIN_KEY_LEN) {
			from = this.prev;
			fromIndex = this.prev.keys.length - 1;
			fromChildIndex = this.isLeaf() ? fromIndex : fromIndex + 1;
			toIndex = 0;
		} else {
			return false;
		}

		this.keys.splice(toIndex, 0, from.keys[fromIndex]);
		from.keys.splice(fromIndex, 1);
		const child: unknown[] = this.isLeaf() ? this.values : this.children;
		let fromChild = null;
		if (this.isLeaf()) {
			fromChild = from.values;
		} else {
			fromChild = from.children;
			fromChild[fromChildIndex].parent = this;
		}
		child.splice(toIndex, 0, fromChild[fromChildIndex]);
		fromChild.splice(fromChildIndex, 1);
		if (!from.isLeaf()) {
			from.fix();
			this.fix();
		}

		return true;
	}

	// Merges with adjacent nodes.
	// |parentPos| indicates this node's position in parent's children.
	private merge(parentPos: number): void {
		let mergeTo: BTreeNode;
		let keyOffset: number;
		let childOffset: number;
		if (this.next && this.next.keys.length < BTreeNode.MAX_KEY_LEN) {
			mergeTo = this.next;
			keyOffset = 0;
			childOffset = 0;
		} else if (this.prev) {
			mergeTo = this.prev;
			keyOffset = mergeTo.keys.length;
			childOffset = mergeTo.isLeaf() ? mergeTo.values.length : mergeTo.children.length;
		} else {
			throw new Exception(ErrorCode.ASSERTION);
		}

		mergeTo.keys.splice(keyOffset, 0, ...this.keys);
		let myChildren = null;
		if (this.isLeaf()) {
			myChildren = this.values;
		} else {
			myChildren = this.children;
			myChildren.forEach((node) => node.parent = mergeTo);
		}
		if (mergeTo.isLeaf()) {
			mergeTo.values.splice(childOffset, 0, ...(myChildren as number[]));
		} else {
			mergeTo.children.splice(childOffset, 0, ...(myChildren as BTreeNode[]));
		}
		BTreeNode.associate(this.prev, this.next);
		if (!mergeTo.isLeaf()) {
			mergeTo.fix();
		}
		if (parentPos !== -1) {
			this.parent.keys.splice(parentPos, 1);
			this.parent.children.splice(parentPos, 1);
		}
	}

	// Split leaf node into two nodes, returns the split internal node.
	private splitLeaf(): BTreeNode {
		const half = BTreeNode.MIN_KEY_LEN;

		const right = BTreeNode.create(this.tree);
		const root = BTreeNode.create(this.tree);

		root.height = 1;
		root.keys = [this.keys[half]];
		root.children = [this, right];
		root.parent = this.parent;

		this.parent = root;
		right.keys = this.keys.splice(half);
		right.values = this.values.splice(half);
		right.parent = root;
		BTreeNode.associate(right, this.next);
		BTreeNode.associate(this, right);
		return root;
	}

	// Split internal node into two nodes, returns the split internal node.
	private splitInternal(): BTreeNode {
		const half = BTreeNode.MIN_KEY_LEN;
		const root = BTreeNode.create(this.tree);
		const right = BTreeNode.create(this.tree);

		root.parent = this.parent;
		root.height = this.height + 1;
		root.keys = [this.keys[half]];
		root.children = [this, right];

		this.keys.splice(half, 1);
		right.parent = root;
		right.height = this.height;
		right.keys = this.keys.splice(half);
		right.children = this.children.splice(half + 1);
		right.children.forEach((node) => node.parent = right);

		this.parent = root;
		BTreeNode.associate(right, this.next);
		BTreeNode.associate(this, right);
		return root;
	}

	// Returns the position where the key is the closest smaller or equals to.
	private searchKey(key: Key | SingleKey): number {
		// Binary search.
		let left = 0;
		let right = this.keys.length;
		const c = this.tree.comparator();
		while (left < right) {
			const middle = left + right >> 1;
			if (c.compare(this.keys[middle], key) === Favor.RHS) {
				left = middle + 1;
			} else {
				right = middle;
			}
		}

		return left;
	}

	private getContainingLeafSingleKey(key: Key): BTreeNode | null {
		if (!this.isLeaf()) {
			let pos = this.searchKey(key);
			if (this.tree.eq(this.keys[pos], key)) {
				pos++;
			}
			return this.children[pos].getContainingLeaf(key);
		}

		return this;
	}

	private getContainingLeafMultiKey(key: SingleKey[]): BTreeNode | null {
		if (!this.isLeaf()) {
			let pos = this.searchKey(key);
			if (this.tree.eq(this.keys[pos], key)) {
				// Note the multi-key comparator will return TIE if compared with an
				// unbounded key. As a result, we need to check if any dimension of the
				// key contains unbound.
				const hasUnbound = key.some((dimension) => dimension === SingleKeyRange.UNBOUND_VALUE);
				if (!hasUnbound) {
					pos++;
				}
			}
			return this.children[pos].getContainingLeafMultiKey(key);
		}

		return this;
	}

	// Appends newly found results to an existing bag of results. For performance
	// reasons, parameters are passed by reference.
	// |params| count is number of filled elements in the results array; limit
	// means max number to fill in the results; reverse means the request is
	// for reverse ordering; skip means remaining skip count.
	private appendResultsAt(
		params: BTreeNodeRangeParam,
		results: number[],
		i: number
	): void {
		if (this.tree.isUniqueKey()) {
			if (!params.reverse && params.skip) {
				params.skip--;
				return;
			}
			results[params.count++] = this.values[i] as number;
		} else {
			const val = this.values[i] as number[];
			for (let j = 0; j < val.length && params.count < results.length; ++j) {
				if (!params.reverse && params.skip) {
					params.skip--;
					continue;
				}
				results[params.count++] = val[j];
			}
		}
	}

	// Appends newly found results to an existing bag of results. For performance
	// reasons, parameters are passed by reference.
	// |params| count is number of filled elements in the results array; limit
	// means max number to fill in the results; reverse means the request is
	// for reverse ordering; skip means remaining skip count.
	private appendResults(
		params: BTreeNodeRangeParam,
		results: number[],
		from: number,
		to: number
	): void {
		for (let i = from; i < to; ++i) {
			if (!params.reverse && params.count >= params.limit) {
				return;
			}
			this.appendResultsAt(params, results, i);
		}
	}
}

class SimpleComparator implements Comparator {
	static compareAscending(lhs: SingleKey, rhs: SingleKey): Favor {
		return lhs > rhs ? Favor.LHS : lhs < rhs ? Favor.RHS : Favor.TIE;
	}

	static compareDescending(lhs: SingleKey, rhs: SingleKey): Favor {
		return SimpleComparator.compareAscending(rhs, lhs);
	}

	static orderRangeAscending(lhs: SingleKeyRange, rhs: SingleKeyRange): Favor {
		return SingleKeyRange.compare(lhs, rhs);
	}

	static orderRangeDescending(lhs: SingleKeyRange, rhs: SingleKeyRange): Favor {
		return SingleKeyRange.compare(rhs, lhs);
	}

	protected compareFn: (lhs: SingleKey, rhs: SingleKey) => Favor;

	private readonly normalizeKeyRange: (
		keyrange?: SingleKeyRange
	) => SingleKeyRange | null;

	private readonly orderRange: (
		lhs: SingleKeyRange,
		rhs: SingleKeyRange
	) => Favor;

	constructor(order: Order) {
		this.compareFn = order === Order.DESC ? SimpleComparator.compareDescending : SimpleComparator.compareAscending;

		this.normalizeKeyRange = order === Order.DESC ? (keyRange?: SingleKeyRange) => {
			return keyRange !== undefined && keyRange !== null ? keyRange.reverse() : null;
		} : (keyRange?: SingleKeyRange) => keyRange || null;

		this.orderRange = order === Order.DESC ? SimpleComparator.orderRangeDescending : SimpleComparator.orderRangeAscending;
	}

	// Checks if the range covers "left" or "right" of the key (inclusive).
	// For example:
	//
	// key is 2, comparator ASC
	//
	// |-----|-----X-----|-----|
	// 0     1     2     3     4
	//
	// range [0, 4] and [2, 2] cover both left and right, so return [true, true].
	// range [0, 2) covers only left, return [true, false].
	// range (2, 0] covers only right, return [false, true].
	compareRange(key: SingleKey, naturalRange: SingleKeyRange): boolean[] {
		const LEFT = 0;
		const RIGHT = 1;
		const range = this.normalizeKeyRange(naturalRange);

		const results = [
			SingleKeyRange.isUnbound(range.from),
			SingleKeyRange.isUnbound(range.to)
		];
		if (!results[LEFT]) {
			const favor = this.compareFn(key, range.from as SingleKey);
			results[LEFT] = range.excludeLower ? favor === Favor.LHS : favor !== Favor.RHS;
		}

		if (!results[RIGHT]) {
			const favor = this.compareFn(key, range.to as SingleKey);
			results[RIGHT] = range.excludeUpper ? favor === Favor.RHS : favor !== Favor.LHS;
		}

		return results;
	}

	compare(lhs: SingleKey, rhs: SingleKey): Favor {
		return this.compareFn(lhs, rhs);
	}

	min(lhs: SingleKey, rhs: SingleKey): Favor {
		return lhs < rhs ? Favor.LHS : lhs === rhs ? Favor.TIE : Favor.RHS;
	}

	max(lhs: SingleKey, rhs: SingleKey): Favor {
		return lhs > rhs ? Favor.LHS : lhs === rhs ? Favor.TIE : Favor.RHS;
	}

	isInRange(key: SingleKey, range: SingleKeyRange): boolean {
		const results = this.compareRange(key, range);
		return results[0] && results[1];
	}

	isFirstKeyInRange(key: SingleKey, range: SingleKeyRange): boolean {
		return this.isInRange(key, range);
	}

	getAllRange(): SingleKeyRange {
		return SingleKeyRange.all();
	}

	orderKeyRange(lhs: SingleKeyRange, rhs: SingleKeyRange): Favor {
		return this.orderRange(lhs, rhs);
	}

	sortKeyRanges(keyRanges: SingleKeyRange[]): SingleKeyRange[] {
		return keyRanges
			.filter((range) => range !== null)
			.sort((lhs, rhs) => this.orderKeyRange(lhs, rhs));
	}

	isLeftOpen(range: SingleKeyRange): boolean {
		return SingleKeyRange.isUnbound(this.normalizeKeyRange(range).from);
	}

	rangeToKeys(naturalRange: SingleKeyRange): SingleKey[] {
		const range = this.normalizeKeyRange(naturalRange);
		return [range.from as SingleKey, range.to as SingleKey];
	}

	comparable(key: SingleKey): boolean {
		return key !== null;
	}

	keyDimensions(): number {
		return 1;
	}

	toString(): string {
		return this.compare === SimpleComparator.compareDescending ? "SimpleComparator_DESC" : "SimpleComparator_ASC";
	}
}

class MultiKeyComparator implements Comparator {
	protected comparators: SimpleComparator[];

	constructor(orders: Order[]) {
		this.comparators = orders.map((order) => new SimpleComparator(order));
	}

	compare(lk: Key, rk: Key): Favor {
		const lhs = lk as MultiKey;
		const rhs = rk as MultiKey;
		return this.forEach(lhs, rhs, (c, l, r) => {
			return l === SingleKeyRange.UNBOUND_VALUE
				|| r === SingleKeyRange.UNBOUND_VALUE ? Favor.TIE : c.compare(l, r);
		});
	}

	min(lk: Key, rk: Key): Favor {
		const lhs = lk as MultiKey;
		const rhs = rk as MultiKey;
		return this.forEach(lhs, rhs, (c, l, r) => c.min(l, r));
	}

	max(lk: Key, rk: Key): Favor {
		const lhs = lk as MultiKey;
		const rhs = rk as MultiKey;
		return this.forEach(lhs, rhs, (c, l, r) => c.max(l, r));
	}

	compareRange(k: Key, range: KeyRange): boolean[] {
		const key = k as MultiKey;
		const results = [true, true];
		for (
			let i = 0;
			i < this.comparators.length && (results[0] || results[1]);
			++i
		) {
			const dimensionResults = this.comparators[i].compareRange(key[i], range[i]);
			results[0] = results[0] && dimensionResults[0];
			results[1] = results[1] && dimensionResults[1];
		}
		return results;
	}

	isInRange(k: Key, range: KeyRange): boolean {
		const key = k as MultiKey;
		let isInRange = true;
		for (let i = 0; i < this.comparators.length && isInRange; ++i) {
			isInRange = this.comparators[i].isInRange(key[i], range[i]);
		}
		return isInRange;
	}

	isFirstKeyInRange(k: Key, range: KeyRange): boolean {
		const key = k as MultiKey;
		return this.comparators[0].isInRange(key[0], range[0]);
	}

	getAllRange(): KeyRange {
		return this.comparators.map((c) => c.getAllRange());
	}

	sortKeyRanges(keyRanges: KeyRange[]): KeyRange[] {
		const outputKeyRanges = keyRanges.filter((range) => {
			return range.every((r) => r !== undefined && r !== null);
		});

		// Ranges are in the format of
		// [[dim0_range0, dim1_range0, ...], [dim0_range1, dim1_range1, ...], ...]
		// Reorganize the array to
		// [[dim0_range0, dim0_range1, ...], [dim1_range0, dim1_range1, ...], ...]
		const keysPerDimensions: KeyRange[] = new Array<KeyRange>(this.comparators.length);
		for (let i = 0; i < keysPerDimensions.length; i++) {
			keysPerDimensions[i] = outputKeyRanges.map((range) => range[i]);
		}
		// Sort ranges per dimension.
		keysPerDimensions.forEach((keys, i) => {
			keys.sort((lhs: SingleKeyRange, rhs: SingleKeyRange) => {
				return this.comparators[i].orderKeyRange(lhs, rhs);
			});
		}, this);

		// Swapping back to original key range format. This time the new ranges
		// are properly aligned from left to right in each dimension.
		const finalKeyRanges: KeyRange[] = new Array<KeyRange>(outputKeyRanges.length);
		for (let i = 0; i < finalKeyRanges.length; i++) {
			finalKeyRanges[i] = keysPerDimensions.map((keys) => keys[i]);
		}

		// Perform another sorting to properly arrange order of ranges with either
		// excludeLower or excludeUpper.
		return finalKeyRanges.sort((lhs, rhs) => {
			let favor = Favor.TIE;
			for (let i = 0; i < this.comparators.length && favor === Favor.TIE; ++i) {
				favor = this.comparators[i].orderKeyRange(lhs[i], rhs[i]);
			}
			return favor;
		});
	}

	isLeftOpen(range: KeyRange): boolean {
		return this.comparators[0].isLeftOpen(range[0]);
	}

	rangeToKeys(keyRange: KeyRange): Key[] {
		const startKey = keyRange.map((range, i) => this.comparators[i].rangeToKeys(range)[0]);
		const endKey = keyRange.map((range, i) => this.comparators[i].rangeToKeys(range)[1]);

		return [startKey, endKey];
	}

	comparable(key: Key): boolean {
		return (key as SingleKey[]).every((keyDimension, i) => this.comparators[i].comparable(keyDimension));
	}

	keyDimensions(): number {
		return this.comparators.length;
	}

	private forEach(
		lhs: MultiKey,
		rhs: MultiKey,
		fn: (c: SimpleComparator, l: SingleKey, r: SingleKey) => Favor
	): Favor {
		let favor = Favor.TIE;
		for (let i = 0; i < this.comparators.length && favor === Favor.TIE; ++i) {
			favor = fn(this.comparators[i], lhs[i], rhs[i]);
		}
		return favor;
	}
}

// This comparator is not used to replace existing NullableIndex wrapper
// because of its compareAscending function requires extra null key
// checking every time, where the wrapper does it only once. This resulted in
// performance difference and therefore the NullableIndex is kept.
class SimpleComparatorWithNull extends SimpleComparator {
	static override compareAscending(lhs: SingleKey, rhs: SingleKey): Favor {
		if (lhs === null) {
			return rhs === null ? Favor.TIE : Favor.RHS;
		}
		return rhs === null ? Favor.LHS : SimpleComparator.compareAscending(lhs, rhs);
	}

	static override compareDescending(lhs: SingleKey, rhs: SingleKey): Favor {
		return SimpleComparatorWithNull.compareAscending(rhs, lhs);
	}

	constructor(order: Order) {
		super(order);

		this.compareFn = order === Order.DESC ? SimpleComparatorWithNull.compareDescending : SimpleComparatorWithNull.compareAscending;
	}

	override isInRange(key: SingleKey, range: SingleKeyRange): boolean {
		return key === null ? range.isAll() : super.isInRange(key, range);
	}

	override min(lhs: SingleKey, rhs: SingleKey): Favor {
		const results = this.minMax(lhs, rhs);
		return results === null ? super.min(lhs, rhs) : results;
	}

	override max(lhs: SingleKey, rhs: SingleKey): Favor {
		const results = this.minMax(lhs, rhs);
		return results === null ? super.max(lhs, rhs) : results;
	}

	private minMax(lhs: SingleKey, rhs: SingleKey): Favor | null {
		if (lhs === null) {
			return rhs === null ? Favor.TIE : Favor.RHS;
		}
		return rhs === null ? Favor.LHS : null;
	}
}

class MultiKeyComparatorWithNull extends MultiKeyComparator {
	constructor(orders: Order[]) {
		super(orders);

		this.comparators = orders.map((order) => {
			return new SimpleComparatorWithNull(order);
		});
	}
}

class ComparatorFactory {
	static create(indexSchema: IndexImpl): MultiKeyComparator | MultiKeyComparatorWithNull | SimpleComparator {
		if (indexSchema.columns.length === 1) {
			return new SimpleComparator(indexSchema.columns[0].order);
		}

		const orders = indexSchema.columns.map((col) => col.order);
		const nullable = indexSchema.columns.some((col) => col.schema.isNullable());
		return nullable ? new MultiKeyComparatorWithNull(orders) : new MultiKeyComparator(orders);
	}
}

// Wraps another index which does not support NULL to accept NULL values.
class NullableIndex implements RuntimeIndex {
	private static readonly NULL_ROW_ID = -2;

	private readonly nulls: Set<number>;

	private readonly statsNull: IndexStats;

	private readonly statsObj: IndexStats;

	constructor(private readonly index: RuntimeIndex) {
		this.nulls = new Set<number>();
		this.statsNull = new IndexStats();
		this.statsObj = new IndexStats();
	}

	getName(): string {
		return this.index.getName();
	}

	add(key: Key, value: number): void {
		if (key === null) {
			// Note: Nullable index allows multiple nullable keys even if it is marked
			// as unique. This is matching the behavior of other SQL engines.
			this.nulls.add(value);
			this.statsNull.add(key, 1);
		} else {
			this.index.add(key, value);
		}
	}

	set(key: Key, value: number): void {
		if (key === null) {
			this.nulls.clear();
			this.statsNull.clear();
			this.add(key, value);
		} else {
			this.index.set(key, value);
		}
	}

	remove(key: Key, rowId?: number): void {
		if (key === null) {
			if (rowId) {
				this.nulls.delete(rowId);
				this.statsNull.remove(key, 1);
			} else {
				this.nulls.clear();
				this.statsNull.clear();
			}
		} else {
			this.index.remove(key, rowId);
		}
	}

	get(key: Key): number[] {
		if (key === null) {
			return Array.from(this.nulls.values());
		} else {
			return this.index.get(key);
		}
	}

	min(): unknown[] | null {
		return this.index.min();
	}

	max(): unknown[] | null {
		return this.index.max();
	}

	cost(keyRange?: KeyRange | SingleKeyRange): number {
		return this.index.cost(keyRange);
	}

	getRange(
		range?: KeyRange[] | SingleKeyRange[],
		reverseOrder?: boolean,
		limit?: number,
		skip?: number
	): number[] {
		const results = this.index.getRange(range, reverseOrder, limit, skip);
		if (range !== undefined && range !== null) {
			return results;
		}

		return results.concat(Array.from(this.nulls.values()));
	}

	clear(): void {
		this.nulls.clear();
		this.index.clear();
	}

	containsKey(key: Key): boolean {
		return key === null ? this.nulls.size !== 0 : this.index.containsKey(key);
	}

	serialize(): Row[] {
		const rows = [
			new Row(NullableIndex.NULL_ROW_ID, {
				"v": Array.from(this.nulls.values())
			})
		];
		return rows.concat(this.index.serialize());
	}

	comparator(): Comparator {
		return this.index.comparator();
	}

	isUniqueKey(): boolean {
		return this.index.isUniqueKey();
	}

	stats(): IndexStats {
		this.statsObj.updateFromList([this.index.stats(), this.statsNull]);
		return this.statsObj;
	}
}

// This is actually the row id set for a given table, but in the form of
// RuntimeIndex.
class RowId implements RuntimeIndex {
	// The Row ID to use when serializing this index to disk. Currently the entire
	// index is serialized to a single lf.Row instance with rowId set to ROW_ID.
	static ROW_ID = 0;

	private static readonly EMPTY_ARRAY: number[] = [];

	private readonly rows: Set<SingleKey>;

	private readonly comparatorObj: SimpleComparator;

	constructor(private readonly name: string) {
		this.rows = new Set<SingleKey>();
		this.comparatorObj = new SimpleComparator(Order.ASC);
	}

	getName(): string {
		return this.name;
	}

	add(key: Key, value: number): void {
		if (typeof key !== "number") {
			// 103: Row id must be numbers.
			throw new Exception(ErrorCode.INVALID_ROW_ID);
		}
		this.rows.add(key);
	}

	set(key: Key, value: number): void {
		this.add(key, value);
	}

	remove(key: Key, rowId?: number): void {
		this.rows.delete(key as SingleKey);
	}

	get(key: Key): number[] {
		return this.containsKey(key) ? [key as number] : RowId.EMPTY_ARRAY;
	}

	min(): unknown[] | null {
		return this.minMax(this.comparatorObj.min.bind(this.comparatorObj));
	}

	max(): unknown[] | null {
		return this.minMax(this.comparatorObj.max.bind(this.comparatorObj));
	}

	cost(keyRange?: KeyRange | SingleKeyRange): number {
		// Give the worst case so that this index is not used unless necessary.
		return this.rows.size;
	}

	getRange(
		range?: KeyRange[] | SingleKeyRange[],
		reverseOrder?: boolean,
		limit?: number,
		skip?: number
	): number[] {
		const keyRanges: SingleKeyRange[] = (range as SingleKeyRange[]) || [
			SingleKeyRange.all()
		];
		const values: number[] = Array.from(this.rows.values()).filter((value) => {
			return keyRanges.some((r) => this.comparatorObj.isInRange(value, r));
		}, this) as number[];
		return IndexHelper.slice(values, reverseOrder, limit, skip);
	}

	clear(): void {
		this.rows.clear();
	}

	containsKey(key: Key): boolean {
		return this.rows.has(key as SingleKey);
	}

	serialize(): Row[] {
		return [new Row(RowId.ROW_ID, { "v": Array.from(this.rows.values()) })];
	}

	comparator(): Comparator {
		return this.comparatorObj;
	}

	isUniqueKey(): boolean {
		return true;
	}

	stats(): IndexStats {
		const stats = new IndexStats();
		stats.totalRows = this.rows.size;
		return stats;
	}

	private minMax(compareFn: (l: SingleKey, r: SingleKey) => Favor): unknown[] | null {
		if (this.rows.size === 0) {
			return null;
		}

		const keys = Array.from(this.rows.values()).reduce((keySoFar, key) => {
			return keySoFar === null || compareFn(key, keySoFar) === Favor.LHS ? key : keySoFar;
		});

		return [keys, [keys]];
	}
}

// In-memory index store that builds all indices at the time of init.
class MemoryIndexStore implements IndexStore {
	private readonly store: Map<string, RuntimeIndex>;

	private readonly tableIndices: Map<string, RuntimeIndex[]>;

	constructor() {
		this.store = new Map<string, RuntimeIndex>();
		this.tableIndices = new Map<string, RuntimeIndex[]>();
	}

	init(schema: Schema): Promise<void> {
		const tables = schema.tables() as BaseTable[];

		tables.forEach((table) => {
			const tableIndices: RuntimeIndex[] = [];
			this.tableIndices.set(table.getName(), tableIndices);

			const rowIdIndexName = table.getRowIdIndexName();
			const rowIdIndex: RuntimeIndex | null = this.get(rowIdIndexName);
			if (rowIdIndex === null) {
				const index = new RowId(rowIdIndexName);
				tableIndices.push(index);
				this.store.set(rowIdIndexName, index);
			}
			(table.getIndices() as IndexImpl[]).forEach((indexSchema) => {
				const index = this.createIndex(indexSchema);
				tableIndices.push(index);
				this.store.set(indexSchema.getNormalizedName(), index);
			}, this);
		}, this);
		return Promise.resolve();
	}

	get(name: string): RuntimeIndex | null {
		return this.store.get(name) || null;
	}

	set(tableName: string, index: RuntimeIndex): void {
		let tableIndices = this.tableIndices.get(tableName) || null;
		if (tableIndices === null) {
			tableIndices = [];
			this.tableIndices.set(tableName, tableIndices);
		}

		// Replace the index in-place in the array if such index already exists.
		let existsAt = -1;
		for (let i = 0; i < tableIndices.length; i++) {
			if (tableIndices[i].getName() === index.getName()) {
				existsAt = i;
				break;
			}
		}

		if (existsAt >= 0 && tableIndices.length > 0) {
			tableIndices.splice(existsAt, 1, index);
		} else {
			tableIndices.push(index);
		}

		this.store.set(index.getName(), index);
	}

	getTableIndices(tableName: string): RuntimeIndex[] {
		return this.tableIndices.get(tableName) || [];
	}

	private createIndex(indexSchema: IndexImpl): RuntimeIndex {
		const comparator = ComparatorFactory.create(indexSchema);
		const index = new BTree(indexSchema.getNormalizedName(), comparator, indexSchema.isUnique);

		return indexSchema.hasNullableColumn() && indexSchema.columns.length === 1 ? new NullableIndex(index) : index;
	}
}

class UserQueryTask extends QueryTask {
	constructor(
		backStore: BackStore,
		schema: Schema,
		cache: Cache,
		indexStore: IndexStore,
		items: TaskItem[]
	) {
		super(backStore, schema, cache, indexStore, items);
	}

	getPriority(): TaskPriority {
		return TaskPriority.USER_QUERY_TASK;
	}
}

interface RemoveResult {
	parent: TreeNode;
	children: TreeNode[];
}

type NodeStringFn = (node: TreeNode) => string;

class TreeHelper {
	// Creates a new tree with the exact same structure, where every node in the
	// tree has been replaced by a new node according to the mapping function.
	// This is equivalent to Array#map, but for a tree data structure.
	// Note: T1 and T2 are expected to be either lf.structs.TreeNode or subtypes
	// but there is no way to currently express that in JS compiler annotations.
	static map<T1 extends TreeNode, T2 extends TreeNode>(
		origTree: T1,
		mapFn: (t: T1) => T2
	): T2 {
		// A stack storing nodes that will be used as parents later in the
		// traversal.
		const copyParentStack: TreeNode[] = [];

		// Removes a node from the parent stack, if that node has already reached
		// its target number of children.
		const cleanUpParentStack = (original: TreeNode, clone: TreeNode) => {
			if (original === null) {
				return;
			}

			const cloneFull = original.getChildCount() === clone.getChildCount();
			if (cloneFull) {
				const cloneIndex = copyParentStack.indexOf(clone);
				if (cloneIndex !== -1) {
					copyParentStack.splice(cloneIndex, 1);
				}
			}
		};

		// The node that should become the parent of the next traversed node.
		let nextParent: TreeNode = null as unknown as TreeNode;
		let copyRoot: T2 = null as unknown as T2;

		origTree.traverse((node) => {
			const newNode = mapFn(node as T1);

			if (node.getParent() === null) {
				copyRoot = newNode;
			} else {
				nextParent.addChild(newNode);
			}

			cleanUpParentStack(node.getParent(), nextParent);
			if (node.getChildCount() > 1) {
				copyParentStack.push(newNode);
			}
			nextParent = node.isLeaf() ? copyParentStack[copyParentStack.length - 1] : newNode;
		});

		return copyRoot;
	}

	// Finds all leafs node existing in the subtree that starts at the given node.
	static getLeafNodes(node: TreeNode): TreeNode[] {
		return TreeHelper.find(node, (n) => n.isLeaf());
	}

	// Removes a node from a tree. It takes care of re-parenting the children of
	// the removed node with its parent (if any).
	// Returns an object holding the parent of the node prior to removal (if any),
	// and the children of the node prior to removal.
	static removeNode(node: TreeNode): RemoveResult {
		const parentNode = node.getParent();
		let originalIndex = 0;
		if (parentNode !== null) {
			originalIndex = parentNode.getChildren().indexOf(node);
			parentNode.removeChild(node);
		}

		const children = node.getChildren().slice();
		children.forEach((child, index) => {
			node.removeChild(child);
			if (parentNode !== null) {
				parentNode.addChildAt(child, originalIndex + index);
			}
		});

		return {
			"children": children,
			"parent": parentNode
		};
	}

	// Inserts a new node under an existing node. The new node inherits all
	// children of the existing node, and the existing node ends up having only
	// the new node as a child. Example: Calling insertNodeAt(n2, n6) would result
	// in the following transformation.
	//
	//        n1              n1
	//       /  \            /  \
	//      n2  n5          n2  n5
	//     /  \      =>    /
	//    n3  n4          n6
	//                   /  \
	//                  n3  n4
	static insertNodeAt(existingNode: TreeNode, newNode: TreeNode): void {
		const children = existingNode.getChildren().slice();
		children.forEach((child) => {
			existingNode.removeChild(child);
			newNode.addChild(child);
		});

		existingNode.addChild(newNode);
	}

	// Swaps a node with its only child. The child also needs to have exactly one
	// child.
	// Example: Calling swapNodeWithChild(n2) would result in the following
	// transformation.
	//
	//        n1              n1
	//       /  \            /  \
	//      n2   n6         n3  n6
	//     /         =>    /
	//    n3              n2
	//   /  \            /  \
	//  n4  n5          n4  n5
	//
	// Returns the new root of the subtree that used to start where "node" was
	// before swapping.
	static swapNodeWithChild(node: TreeNode): TreeNode {
		assert(node.getChildCount() === 1);
		const child = node.getChildAt(0);
		assert(child.getChildCount() === 1);

		TreeHelper.removeNode(node);
		TreeHelper.insertNodeAt(child, node);
		return child;
	}

	// Pushes a node below its only child. It takes care of replicating the node
	// only for those branches where it makes sense.
	// Example: Calling
	//   pushNodeBelowChild(
	//       n2,
	//       function(grandChild) {return true;},
	//       function(node) {return node.clone();})
	//  would result in the following transformation.
	//
	//        n1              n1
	//       /  \            /  \
	//      n2   n6         n3  n6
	//     /         =>    /  \
	//    n3             n2'  n2''
	//   /  \            /      \
	//  n4  n5          n4      n5
	//
	//  where n2 has been pushed below n3, on both branches. n2'and n2'' denote
	//  that copies of the original node were made.
	//
	// |shouldPushDownFn| is a function that is called on every grandchild to
	// determine whether the node can be pushed down on that branch.
	// |cloneFn| is a function used to clone the node that is being pushed down.
	//
	// Returns the new parent of the subtree that used to start at "node" or
	// "node" itself if it could not be pushed down at all.
	static pushNodeBelowChild(
		node: TreeNode,
		shouldPushDownFn: (node: TreeNode) => boolean,
		cloneFn: (node: TreeNode) => TreeNode
	): TreeNode {
		assert(node.getChildCount() === 1);
		const child = node.getChildAt(0);
		assert(child.getChildCount() > 1);

		const grandChildren = child.getChildren().slice();
		const canPushDown = grandChildren.some((grandChild) => shouldPushDownFn(grandChild));

		if (!canPushDown) {
			return node;
		}
		TreeHelper.removeNode(node);

		grandChildren.forEach((grandChild, index) => {
			if (shouldPushDownFn(grandChild)) {
				const newNode = cloneFn(node);
				child.removeChildAt(index);
				newNode.addChild(grandChild);
				child.addChildAt(newNode, index);
			}
		});

		return child;
	}

	// Replaces a chain of nodes with a new chain of nodes.
	// Example: Calling replaceChainWithChain(n2, n3, n7, n8) would result in the
	// following transformation.
	//
	//        n1              n1
	//       /  \            /  \
	//      n2   n6         n7   n6
	//     /         =>    /
	//    n3              n8
	//   /  \            /  \
	//  n4  n5          n4  n5
	//
	// Returns the new root of the subtree that used to start at "old head".
	// Effectively the new root is always equal to "newHead".
	static replaceChainWithChain(
		oldHead: TreeNode,
		oldTail: TreeNode,
		newHead: TreeNode,
		newTail: TreeNode
	): TreeNode {
		const parentNode = oldHead.getParent();
		if (parentNode !== null) {
			const oldHeadIndex = parentNode.getChildren().indexOf(oldHead);
			parentNode.removeChildAt(oldHeadIndex);
			parentNode.addChildAt(newHead, oldHeadIndex);
		}

		oldTail
			.getChildren()
			.slice()
			.forEach((child) => {
				oldTail.removeChild(child);
				newTail.addChild(child);
			});

		return newHead;
	}

	// Removes a node from the tree, and replaces it with a chain of nodes where
	// each node in the chain (excluding the tail) has exactly one child.
	// Example: Calling replaceNodeWithChain(n6, n10, n12), where the chain
	// consists of n7->n8->n9, would result in the following transformation.
	//
	//        n1               n1
	//       /  \             /  \
	//      n2   n6          n2  n10
	//     /    /  \    =>  /      \
	//    n3   n7  n8      n3      n11
	//   /  \             /  \       \
	//  n4  n5          n4   n5      n12
	//                               /  \
	//                              n7  n8
	//
	// Returns the new root of the subtree that used to start at "node".
	// Effectively the new root is always equal to "head".
	static replaceNodeWithChain(
		node: TreeNode,
		head: TreeNode,
		tail: TreeNode
	): TreeNode {
		return TreeHelper.replaceChainWithChain(node, node, head, tail);
	}

	// Replaces a chain of nodes with a new node.
	// Example: Calling replaceChainWithNode(n2, n3, n7) would result in the
	// following transformation.
	//
	//        n1              n1
	//       /  \            /  \
	//      n2   n6         n7   n6
	//     /         =>    /  \
	//    n3              n4  n5
	//   /  \
	//  n4  n5
	//
	// Returns the new root of the subtree that used to start at "head".
	// Effectively the new root is always equal to "node".
	static replaceChainWithNode(
		head: TreeNode,
		tail: TreeNode,
		node: TreeNode
	): TreeNode {
		return TreeHelper.replaceChainWithChain(head, tail, node, node);
	}

	// Finds all nodes in the given tree that satisfy a given condition.
	// |root| is the root of the tree to search.
	// |filterFn| is the filter function. It will be called on every node of
	// the tree.
	// |stopFn| is a function that indicates whether searching should be stopped.
	// It will be called on every visited node on the tree. If false is returned
	// searching will stop for nodes below that node. If such a function were not
	// provided the entire tree is searched.
	static find(
		root: TreeNode,
		filterFn: (node: TreeNode) => boolean,
		stopFn?: (node: TreeNode) => boolean
	): TreeNode[] {
		const results: TreeNode[] = [];

		/** @param {!lf.structs.TreeNode} node */
		const filterRec = (node: TreeNode) => {
			if (filterFn(node)) {
				results.push(node);
			}
			if (stopFn === undefined || stopFn === null || !stopFn(node)) {
				node.getChildren().forEach(filterRec);
			}
		};

		filterRec(root);
		return results;
	}

	// Returns a string representation of a tree. Useful for testing/debugging.
	// |stringFunc| is the function to use for converting a single node to a
	// string. If not provided a default function will be used.
	static toString(rootNode: TreeNode, stringFunc?: NodeStringFn): string {
		const defaultStringFn: NodeStringFn = (node: TreeNode) => {
			return node.toString() + "\n";
		};
		const stringFn: NodeStringFn = stringFunc || defaultStringFn;
		let out = "";
		rootNode.traverse((node) => {
			for (let i = 0; i < node.getDepth(); i++) {
				out += "-";
			}
			out += stringFn(node);
		});
		return out;
	}
}

class CombinedPredicate extends PredicateNode {
	private isComplement: boolean;

	constructor(public operator: Operator) {
		super();

		// Whether this predicate has been reversed. This is necessary only for
		// handling the case where setComplement() is called twice with the same
		// value.
		this.isComplement = false;
	}

	eval(relation: Relation): Relation {
		const results = this.getChildren().map((condition) => (condition as PredicateNode).eval(relation));
		return this.combineResults(results);
	}

	setComplement(isComplement: boolean): void {
		if (this.isComplement === isComplement) {
			// Nothing to do.
			return;
		}

		this.isComplement = isComplement;

		// NOT(AND(c1, c2)) becomes OR(NOT(c1), NOT(c2)).
		// NOT(OR(c1, c2)) becomes AND(NOT(c1), NOT(c2)).

		// Toggling AND/OR.
		this.operator = this.operator === Operator.AND ? Operator.OR : Operator.AND;

		// Toggling children conditions.
		this.getChildren().forEach((condition) => {
			(condition as PredicateNode).setComplement(isComplement);
		});
	}

	copy(): CombinedPredicate {
		const copy = TreeHelper.map(this, (node) => {
			if (node instanceof CombinedPredicate) {
				const tempCopy = new CombinedPredicate(node.operator);
				tempCopy.isComplement = node.isComplement;
				tempCopy.setId(node.getId());
				return tempCopy;
			} else {
				return (node as PredicateNode).copy() as PredicateNode;
			}
		}) as CombinedPredicate;
		return copy;
	}

	getColumns(results?: Column[]): Column[] {
		const columns = results || [];
		this.traverse((child) => {
			if (child === this) {
				return;
			}
			(child as PredicateNode).getColumns(columns);
		});

		const columnSet = new Set<Column>(columns);
		return Array.from(columnSet.values());
	}

	getTables(results?: Set<Table>): Set<Table> {
		const tables = results ? results : new Set<Table>();
		this.traverse((child) => {
			if (child === this) {
				return;
			}
			(child as PredicateNode).getTables(tables);
		});
		return tables;
	}

	override toString(): string {
		return `combined_pred_${this.operator.toString()}`;
	}

	// Converts this predicate to a key range.
	// NOTE: Not all predicates can be converted to a key range, callers must call
	// isKeyRangeCompatible() before calling this method.
	toKeyRange(): SingleKeyRangeSet {
		assert(this.isKeyRangeCompatible(), "Could not convert combined predicate to key range.");

		if (this.operator === Operator.OR) {
			const keyRangeSet = new SingleKeyRangeSet();
			this.getChildren().forEach((child) => {
				const childKeyRanges = (child as ValuePredicate)
					.toKeyRange()
					.getValues();
				keyRangeSet.add(childKeyRanges);
			});
			return keyRangeSet;
		} else {
			// this.operator.lf.pred.Operator.OR
			// Unreachable code, because the assertion above should have already
			// thrown an error if this predicate is of type AND.
			assert(false, "toKeyRange() called for an AND predicate.");
			return new SingleKeyRangeSet();
		}
	}

	// Returns whether this predicate can be converted to a set of key ranges.
	isKeyRangeCompatible(): boolean {
		if (this.operator === Operator.OR) {
			return this.isKeyRangeCompatibleOr();
		}

		// AND predicates are broken down to individual predicates by the optimizer,
		// and therefore there is no need to convert an AND predicate to a key
		// range, because such predicates do not exist in the tree during query
		// execution.
		return false;
	}

	// Combines the results of all the children predicates.
	private combineResults(results: Relation[]): Relation {
		if (this.operator === Operator.AND) {
			return Relation.intersect(results);
		} else {
			// Must be the case where this.operator === Operator.OR.
			return Relation.union(results);
		}
	}

	// Checks if this OR predicate can be converted to a set of key ranges.
	// Currently only OR predicates that satisfy all of the following criteria can
	// be converted.
	//  1) Every child is a ValuePredicate
	//  2) All children refer to the same table and column.
	//  3) All children are key range compatible.
	private isKeyRangeCompatibleOr(): boolean {
		let predicateColumn: Column | null = null;
		return this.getChildren().every((child) => {
			const isCandidate = child instanceof ValuePredicate && child.isKeyRangeCompatible();
			if (!isCandidate) {
				return false;
			}
			if (predicateColumn === null) {
				predicateColumn = child.column;
			}
			return (
				predicateColumn.getNormalizedName() === child.column.getNormalizedName()
			);
		});
	}
}

interface IndexJoinInfo {
	indexedColumn: Column;
	nonIndexedColumn: Column;
	index: RuntimeIndex;
}

class JoinPredicate extends PredicateNode {
	// Exponent of block size, so the block size is 2^(BLOCK_SIZE_EXPONENT).
	private static readonly BLOCK_SIZE_EXPONENT = 8;

	private nullPayload: PayloadType;

	private evaluatorFn: ComparisonFunction;

	private readonly keyOfIndexFn: KeyOfIndexFunction;

	constructor(
		public leftColumn: Column,
		public rightColumn: Column,
		public evaluatorType: EvalType
	) {
		super();
		this.nullPayload = null as unknown as PayloadType;

		const registry = EvalRegistry.get();
		this.evaluatorFn = registry.getEvaluator(this.leftColumn.getType(), this.evaluatorType);
		this.keyOfIndexFn = registry.getKeyOfIndexEvaluator(this.leftColumn.getType());
	}

	copy(): JoinPredicate {
		const clone = new JoinPredicate(this.leftColumn, this.rightColumn, this.evaluatorType);
		clone.setId(this.getId());
		return clone;
	}

	getColumns(results?: Column[]): Column[] {
		if (results !== undefined && results !== null) {
			results.push(this.leftColumn);
			results.push(this.rightColumn);
			return results;
		}
		return [this.leftColumn, this.rightColumn];
	}

	getTables(results?: Set<Table>): Set<Table> {
		const tables = results !== undefined && results !== null ? results : new Set<BaseTable>();
		tables.add(this.leftColumn.getTable());
		tables.add(this.rightColumn.getTable());
		return tables;
	}

	// Creates a new predicate with the  left and right columns swapped and
	// operator changed (if necessary).
	reverse(): JoinPredicate {
		let evaluatorType = this.evaluatorType;
		switch (this.evaluatorType) {
			case EvalType.GT:
				evaluatorType = EvalType.LT;
				break;
			case EvalType.LT:
				evaluatorType = EvalType.GT;
				break;
			case EvalType.GTE:
				evaluatorType = EvalType.LTE;
				break;
			case EvalType.LTE:
				evaluatorType = EvalType.GTE;
				break;
			default:
				break;
		}
		const newPredicate = new JoinPredicate(this.rightColumn, this.leftColumn, evaluatorType);
		return newPredicate;
	}

	eval(relation: Relation): Relation {
		const entries = relation.entries.filter((entry) => {
			const leftValue = entry.getField(this.leftColumn);
			const rightValue = entry.getField(this.rightColumn);
			return this.evaluatorFn(leftValue, rightValue);
		}, this);

		return new Relation(entries, relation.getTables());
	}

	override toString(): string {
		return (
			"join_pred("
			+ this.leftColumn.getNormalizedName()
			+ " "
			+ this.evaluatorType
			+ " "
			+ this.rightColumn.getNormalizedName()
			+ ")"
		);
	}

	// Calculates the join between the input relations using a Nested-Loop-Join
	// algorithm.
	// Nulls cannot be matched. Hence Inner join does not return null matches
	// at all and Outer join retains each null entry of the left table.
	evalRelationsNestedLoopJoin(
		leftRelation: Relation,
		rightRelation: Relation,
		isOuterJoin: boolean
	): Relation {
		let leftRightRelations = [leftRelation, rightRelation];
		// For outer join, left and right are not interchangeable.
		if (!isOuterJoin) {
			leftRightRelations = this.detectLeftRight(leftRelation, rightRelation);
		}
		leftRelation = leftRightRelations[0];
		rightRelation = leftRightRelations[1];

		const combinedEntries = [];
		const leftRelationTables = leftRelation.getTables();
		const rightRelationTables = rightRelation.getTables();
		const leftEntriesLength = leftRelation.entries.length;
		const rightEntriesLength = rightRelation.entries.length;

		// Since block size is a power of two, we can use bitwise operators.
		const blockNumBits = JoinPredicate.BLOCK_SIZE_EXPONENT;
		// This is equivalent to Math.ceil(rightEntriesLength/blockSize).
		const blockCount = rightEntriesLength + (1 << blockNumBits) - 1 >> blockNumBits;
		let currentBlock = 0;
		// The inner loop is executed in blocks. Blocking helps in pre-fetching
		// the next contents by CPU and also reduces cache misses as long as a block
		// is close to the size of cache.
		while (currentBlock < blockCount) {
			for (let i = 0; i < leftEntriesLength; i++) {
				let matchFound = false;
				const leftValue = leftRelation.entries[i].getField(this.leftColumn);
				if (leftValue !== null) {
					const rightLimit = Math.min(currentBlock + 1 << blockNumBits, rightEntriesLength);
					for (let j = currentBlock << blockNumBits; j < rightLimit; j++) {
						// Evaluating before combining the rows, since combining is fairly
						// expensive.
						const predicateResult = this.evaluatorFn(leftValue, rightRelation.entries[j].getField(this.rightColumn));

						if (predicateResult) {
							matchFound = true;
							const combinedEntry = RelationEntry.combineEntries(leftRelation.entries[i], leftRelationTables, rightRelation.entries[j], rightRelationTables);
							combinedEntries.push(combinedEntry);
						}
					}
				}
				if (isOuterJoin && !matchFound) {
					combinedEntries.push(this.createCombinedEntryForUnmatched(leftRelation.entries[i], leftRelationTables));
				}
			}
			currentBlock++;
		}
		const srcTables = leftRelation
			.getTables()
			.concat(rightRelation.getTables());
		return new Relation(combinedEntries, srcTables);
	}

	// Calculates the join between the input relations using a Hash-Join
	// algorithm. Such a join implementation can only be used if the join
	// conditions is the "equals" operator.
	// Nulls cannot be matched. Hence Inner join does not return null matches
	// at all and Outer join retains each null entry of the left table.
	evalRelationsHashJoin(
		leftRelation: Relation,
		rightRelation: Relation,
		isOuterJoin: boolean
	): Relation {
		let leftRightRelations = [leftRelation, rightRelation];
		// For outer join, left and right are not interchangeable.
		if (!isOuterJoin) {
			leftRightRelations = this.detectLeftRight(leftRelation, rightRelation);
		}
		leftRelation = leftRightRelations[0];
		rightRelation = leftRightRelations[1];

		// If it is an outer join, then swap to make sure that the right table is
		// used for the "build" phase of the hash-join algorithm. If it is inner
		// join, choose the smaller of the two relations to be used for the "build"
		// phase.
		let minRelation = leftRelation;
		let maxRelation = rightRelation;
		let minColumn = this.leftColumn;
		let maxColumn = this.rightColumn;
		if (isOuterJoin) {
			minRelation = rightRelation;
			maxRelation = leftRelation;
			minColumn = this.rightColumn;
			maxColumn = this.leftColumn;
		}

		const map = new MapSet<string, RelationEntry>();
		const combinedEntries: RelationEntry[] = [];

		minRelation.entries.forEach((entry) => {
			const key = String(entry.getField(minColumn));
			map.set(key, entry);
		});

		const minRelationTableNames = minRelation.getTables();
		const maxRelationTableNames = maxRelation.getTables();

		maxRelation.entries.forEach((entry) => {
			const value = entry.getField(maxColumn);
			const key = String(value);
			if (value !== null && map.has(key)) {
				(map.get(key) as unknown as RelationEntry[]).forEach((innerEntry) => {
					const combinedEntry = RelationEntry.combineEntries(entry, maxRelationTableNames, innerEntry, minRelationTableNames);
					combinedEntries.push(combinedEntry);
				});
			} else if (isOuterJoin) {
				combinedEntries.push(this.createCombinedEntryForUnmatched(entry, maxRelationTableNames));
			}
		}, this);

		const srcTables = leftRelation
			.getTables()
			.concat(rightRelation.getTables());
		return new Relation(combinedEntries, srcTables);
	}

	evalRelationsIndexNestedLoopJoin(
		leftRelation: Relation,
		rightRelation: Relation,
		indexJoinInfo: IndexJoinInfo,
		cache: Cache
	): Relation {
		assert(this.evaluatorType === EvalType.EQ, "For now, index nested loop join can only be leveraged for EQ.");

		// Detecting which relation should be used as outer (non-indexed) and which
		// as inner (indexed).
		const indexedTable = indexJoinInfo.indexedColumn.getTable() as BaseTable;
		let outerRelation = leftRelation;
		let innerRelation = rightRelation;
		if (leftRelation.getTables().includes(indexedTable.getEffectiveName())) {
			outerRelation = rightRelation;
			innerRelation = leftRelation;
		}

		const combinedEntries: RelationEntry[] = [];
		const innerRelationTables = innerRelation.getTables();
		const outerRelationTables = outerRelation.getTables();

		// Generates and pushes a new combined entry to the results.
		// |row| is The row corresponding to the inner entry.
		function pushCombinedEntry(outerEntry: RelationEntry, row: Row): void {
			const innerEntry = new RelationEntry(row, innerRelationTables.length > 1);
			const combinedEntry = RelationEntry.combineEntries(outerEntry, outerRelationTables, innerEntry, innerRelationTables);
			combinedEntries.push(combinedEntry);
		}

		outerRelation.entries.forEach((entry) => {
			const keyOfIndex = this.keyOfIndexFn(entry.getField(indexJoinInfo.nonIndexedColumn) as IndexableType);
			const matchingRowIds = indexJoinInfo.index.get(keyOfIndex as Key);
			if (matchingRowIds.length === 0) {
				return;
			}
			if (indexJoinInfo.index.isUniqueKey()) {
				// Since the index has only unique keys, expecting only one rowId.
				// Using Cache#get, instead of Cache#getMany, since it has better
				// performance (no unnecessary array allocations).
				pushCombinedEntry(entry, cache.get(matchingRowIds[0]));
			} else {
				const rows = cache.getMany(matchingRowIds);
				rows.forEach((r) => {
					pushCombinedEntry(entry, r);
				});
			}
		}, this);

		const srcTables = outerRelation
			.getTables()
			.concat(innerRelation.getTables());
		return new Relation(combinedEntries, srcTables);
	}

	setComplement(isComplement: boolean): void {
		throw new Exception(ErrorCode.ASSERTION, "Join predicate has no complement");
	}

	// Swaps left and right columns and changes operator (if necessary).
	private reverseSelf(): void {
		const temp = this.leftColumn;
		this.leftColumn = this.rightColumn;
		this.rightColumn = temp;

		let evaluatorType = this.evaluatorType;
		switch (this.evaluatorType) {
			case EvalType.GT:
				evaluatorType = EvalType.LT;
				break;
			case EvalType.LT:
				evaluatorType = EvalType.GT;
				break;
			case EvalType.GTE:
				evaluatorType = EvalType.LTE;
				break;
			case EvalType.LTE:
				evaluatorType = EvalType.GTE;
				break;
			default:
				return;
		}
		this.evaluatorType = evaluatorType;
		this.evaluatorFn = EvalRegistry.get().getEvaluator(this.leftColumn.getType(), this.evaluatorType);
	}

	// Returns whether the given relation can be used as the "left" parameter of
	// this predicate.
	private appliesToLeft(relation: Relation): boolean {
		return relation
			.getTables()
			.includes((this.leftColumn.getTable() as BaseTable).getEffectiveName());
	}

	// Returns whether the given relation can be used as the "right" parameter of
	// this predicate.
	private appliesToRight(relation: Relation): boolean {
		return relation
			.getTables()
			.includes((this.rightColumn.getTable() as BaseTable).getEffectiveName());
	}

	// Asserts that the given relations are applicable to this join predicate.
	// Example of non-applicable relations:
	//   - join predicate: photoTable.albumId == albumTable.id
	//   leftRelation.getTables() does not include photoTable, or
	//   rightRelation.getTables() does not include albumTable.
	private assertRelationsApply(left: Relation, right: Relation): void {
		assert(this.appliesToLeft(left), "Mismatch between join predicate left operand and right relation.");
		assert(this.appliesToRight(right), "Mismatch between join predicate right operand and right relation.");
	}

	// Detects which input relation should be used as left/right. If predicate
	// order does not match with the left and right relations, left and right are
	// reversed. If the right table has larger size, then the left, right and
	// evaluation type are reversed (This is done to make it more cache
	// efficient).
	// Returns an array holding the two input relations in the order of
	// [left, right].
	private detectLeftRight(
		relation1: Relation,
		relation2: Relation
	): [Relation, Relation] {
		let left: Relation = null as unknown as Relation;
		let right: Relation = null as unknown as Relation;

		if (this.appliesToLeft(relation1)) {
			this.assertRelationsApply(relation1, relation2);
			left = relation1;
			right = relation2;
		} else {
			this.assertRelationsApply(relation2, relation1);
			left = relation2;
			right = relation1;
		}
		if (left.entries.length > right.entries.length) {
			this.reverseSelf();
			this.assertRelationsApply(right, left);
			return [right, left];
		}
		return [left, right];
	}

	// Creates a row with null columns with column names obtained from the table.
	private createNullPayload(table: BaseTable): PayloadType {
		const payload: PayloadType = {};
		table.getColumns().forEach((column) => payload[column.getName()] = null);
		return payload;
	}

	// Creates a combined entry with an unmatched left entry from outer join
	// algorithm and a null entry.
	private createCombinedEntryForUnmatched(
		entry: RelationEntry,
		leftRelationTables: string[]
	): RelationEntry {
		if (this.nullPayload === null) {
			this.nullPayload = this.createNullPayload(this.rightColumn.getTable() as BaseTable);
		}
		// The right relation is guaranteed to never be the result
		// of a previous join.
		const nullEntry = new RelationEntry(new Row(Row.DUMMY_ID, this.nullPayload), false);
		const combinedEntry = RelationEntry.combineEntries(entry, leftRelationTables, nullEntry, [(this.rightColumn.getTable() as BaseTable).getEffectiveName()]);
		return combinedEntry;
	}
}

type V = ArrayBuffer | Date | boolean | number | string;

class SqlHelper {
	static toSql(builder: BaseBuilder<Context>, stripValueInfo = false): string {
		const query = builder.getQuery();

		if (query instanceof SelectContext) {
			return SqlHelper.selectToSql(query, stripValueInfo);
		}

		// 358: toSql() is not implemented for {0}.
		throw new Exception(ErrorCode.NOT_IMPL_IN_TOSQL, typeof query);
	}

	private static escapeSqlValue(type: Type, val: unknown): number | string {
		const value = val as V;
		if (value === undefined || value === null) {
			return "NULL";
		}

		switch (type) {
			case Type.BOOLEAN:
				return value ? 1 : 0;

			case Type.INTEGER:
			case Type.NUMBER:
				return value as number;

			case Type.ARRAY_BUFFER:
				// Note: Oracle format is used here.
				return `'${Row.binToHex(value as ArrayBuffer)}'`;

			default:
				// datetime, string
				return `'${value.toString()}'`;
		}
	}

	private static evaluatorToSql(op: EvalType): string {
		switch (op) {
			case EvalType.BETWEEN:
				return "BETWEEN";
			case EvalType.EQ:
				return "=";
			case EvalType.GTE:
				return ">=";
			case EvalType.GT:
				return ">";
			case EvalType.IN:
				return "IN";
			case EvalType.LTE:
				return "<=";
			case EvalType.LT:
				return "<";
			case EvalType.MATCH:
				return "LIKE";
			case EvalType.NEQ:
				return "<>";
			default:
				return "UNKNOWN";
		}
	}

	private static valueToSql(
		value: unknown,
		op: EvalType,
		type: Type,
		stripValueInfo: boolean
	): string {
		if (value instanceof Binder) {
			return "?" + value.getIndex().toString();
		}

		if (stripValueInfo) {
			return value !== undefined && value !== null ? "#" : "NULL";
		} else if (op === EvalType.MATCH) {
			return `'${(value as V).toString()}'`;
		} else if (op === EvalType.IN) {
			const array = value as V[];
			const vals = array.map((e) => SqlHelper.escapeSqlValue(type, e));
			return `(${vals.join(", ")})`;
		} else if (op === EvalType.BETWEEN) {
			return (
				SqlHelper.escapeSqlValue(type, (value as unknown[])[0])
				+ " AND "
				+ SqlHelper.escapeSqlValue(type, (value as unknown[])[1])
			);
		}

		return SqlHelper.escapeSqlValue(type, value).toString();
	}

	private static valuePredicateToSql(
		pred: ValuePredicate,
		stripValueInfo: boolean
	): string {
		const column = pred.column.getNormalizedName();
		const op = SqlHelper.evaluatorToSql(pred.evaluatorType);
		const value = SqlHelper.valueToSql(pred.peek(), pred.evaluatorType, pred.column.getType(), stripValueInfo);
		if (op === "=" && value === "NULL") {
			return [column, "IS NULL"].join(" ");
		} else if (op === "<>" && value === "NULL") {
			return [column, "IS NOT NULL"].join(" ");
		} else {
			return [column, op, value].join(" ");
		}
	}

	private static combinedPredicateToSql(
		pred: CombinedPredicate,
		stripValueInfo: boolean
	): string {
		const children = pred.getChildren().map((childNode) => {
			return (
				"("
				+ SqlHelper.parseSearchCondition(childNode as PredicateNode, stripValueInfo)
				+ ")"
			);
		});
		const joinToken = pred.operator === Operator.AND ? " AND " : " OR ";
		return children.join(joinToken);
	}

	private static joinPredicateToSql(pred: JoinPredicate): string {
		return [
			pred.leftColumn.getNormalizedName(),
			SqlHelper.evaluatorToSql(pred.evaluatorType),
			pred.rightColumn.getNormalizedName()
		].join(" ");
	}

	private static parseSearchCondition(
		pred: Predicate,
		stripValueInfo: boolean
	): string {
		if (pred instanceof ValuePredicate) {
			return SqlHelper.valuePredicateToSql(pred, stripValueInfo);
		} else if (pred instanceof CombinedPredicate) {
			return SqlHelper.combinedPredicateToSql(pred, stripValueInfo);
		} else if (pred instanceof JoinPredicate) {
			return SqlHelper.joinPredicateToSql(pred);
		}

		// 357: toSql() does not support predicate type: {0}.
		throw new Exception(357, typeof pred);
	}

	private static predicateToSql(
		pred: Predicate,
		stripValueInfo: boolean
	): string {
		const whereClause = SqlHelper.parseSearchCondition(pred, stripValueInfo);
		if (whereClause) {
			return " WHERE " + whereClause;
		}
		return "";
	}

	private static selectToSql(
		query: SelectContext,
		stripValueInfo: boolean
	): string {
		let colList = "*";
		if (query.columns.length) {
			colList = query.columns
				.map((c) => {
					const col = c as BaseColumn;
					if (col.getAlias()) {
						return col.getNormalizedName() + " AS " + col.getAlias();
					} else {
						return col.getNormalizedName();
					}
				})
				.join(", ");
		}

		let sql = "SELECT " + colList + " FROM ";
		if (query.outerJoinPredicates && query.outerJoinPredicates.size !== 0) {
			sql += SqlHelper.getFromListForOuterJoin(query, stripValueInfo);
		} else {
			sql += SqlHelper.getFromListForInnerJoin(query, stripValueInfo);
			if (query.where) {
				sql += SqlHelper.predicateToSql(query.where, stripValueInfo);
			}
		}

		if (query.orderBy) {
			const orderBy = query.orderBy
				.map((order) => {
					return (
						order.column.getNormalizedName()
						+ (order.order === Order.DESC ? " DESC" : " ASC")
					);
				})
				.join(", ");
			sql += " ORDER BY " + orderBy;
		}

		if (query.groupBy) {
			const groupBy = query.groupBy
				.map((col) => col.getNormalizedName())
				.join(", ");
			sql += " GROUP BY " + groupBy;
		}

		if (query.limit) {
			sql += " LIMIT " + query.limit.toString();
		}

		if (query.skip) {
			sql += " SKIP " + query.skip.toString();
		}

		sql += ";";
		return sql;
	}

	private static getTableNameToSql(t: Table): string {
		const table = t as BaseTable;
		return table.getEffectiveName() !== table.getName() ? table.getName() + " AS " + table.getEffectiveName() : table.getName();
	}

	// Handles Sql queries that have left outer join.
	private static getFromListForOuterJoin(
		query: SelectContext,
		stripValueInfo: boolean
	): string {
		// Retrieves all JoinPredicates.
		const retrievedNodes = TreeHelper.find(query.where as PredicateNode, (n: TreeNode) => n instanceof JoinPredicate) as PredicateNode[];
		const predicateString = retrievedNodes.map((n: PredicateNode) => SqlHelper.joinPredicateToSql(n as JoinPredicate));

		let fromList = SqlHelper.getTableNameToSql(query.from[0]);
		for (let i = 1; i < query.from.length; i++) {
			const fromName = SqlHelper.getTableNameToSql(query.from[i]);
			if (
				query.outerJoinPredicates.has(retrievedNodes[predicateString.length - i].getId())
			) {
				fromList += " LEFT OUTER JOIN " + fromName;
			} else {
				fromList += " INNER JOIN " + fromName;
			}
			fromList += " ON (" + predicateString[predicateString.length - i] + ")";
		}

		const node = query.where as PredicateNode;
		const leftChild = node.getChildCount() > 0 ? node.getChildAt(0) : node;

		// The following condition checks that where has been called in the query.
		if (!(leftChild instanceof JoinPredicate)) {
			fromList
				+= " WHERE "
				+ SqlHelper.parseSearchCondition(leftChild as PredicateNode, stripValueInfo);
		}
		return fromList;
	}

	private static getFromListForInnerJoin(
		query: SelectContext,
		stripValueInfo: boolean
	): string {
		return query.from.map(SqlHelper.getTableNameToSql).join(", ");
	}
}

class BaseBuilder<CONTEXT extends Context> implements QueryBuilder {
	protected query: CONTEXT;

	private readonly queryEngine: QueryEngine;

	private readonly runner: Runner;

	private plan!: PhysicalQueryPlan;

	constructor(
		private readonly backStore,
		private readonly schema,
		private readonly cache,
		private readonly indexStore,
		queryEngine,
		runner,
		context: Context
	) {
		this.queryEngine = queryEngine;
		this.runner = runner;
		this.query = context as CONTEXT;
	}

	exec(): Promise<unknown> {
		try {
			this.assertExecPreconditions();
		} catch (e) {
			return Promise.reject(e);
		}

		return new Promise((resolve, reject) => {
			const queryTask = new UserQueryTask(this.backStore, this.schema, this.cache, this.indexStore, [this.getTaskItem()]);
			this.runner.scheduleTask(queryTask).then((results) => {
				resolve(results[0].getPayloads());
			}, reject);
		});
	}

	explain(): string {
		const stringFn = (node: TreeNode) => `${(node as PhysicalQueryPlanNode).toContextString(this.query)}\n`;
		return TreeHelper.toString(this.getPlan().getRoot(), stringFn);
	}

	bind(values: unknown[]): QueryBuilder {
		this.query.bind(values);
		return this;
	}

	toSql(stripValueInfo = false): string {
		return SqlHelper.toSql(this, stripValueInfo);
	}

	// Asserts whether the preconditions for executing this query are met. Should
	// be overridden by subclasses.
	assertExecPreconditions(): void {
		// No-op default implementation.
	}

	getQuery(): CONTEXT {
		return this.query.clone() as CONTEXT;
	}

	getTaskItem(): TaskItem {
		return {
			"context": this.getQuery(),
			"plan": this.getPlan()
		};
	}

	private getPlan(): PhysicalQueryPlan {
		if (this.plan === undefined || this.plan === null) {
			this.plan = this.queryEngine.getPlan(this.query);
		}
		return this.plan;
	}
}

// Base class for AggregateColumn and StarColumn which does not support
// PredicateProvider interface.
class NonPredicateProvider implements PredicateProvider {
	eq(operand: OperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	neq(operand: OperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	lt(operand: OperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	lte(operand: OperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	gt(operand: OperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	gte(operand: OperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	match(operand: Binder | RegExp): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	between(from: ValueOperandType, to: ValueOperandType): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	in(values: Binder | ValueOperandType[]): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	isNull(): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}

	isNotNull(): Predicate {
		throw new Exception(ErrorCode.SYNTAX_ERROR);
	}
}

class AggregatedColumn extends NonPredicateProvider implements BaseColumn {
	alias: string | null;

	// Make TypeScript happy.
	[key: string]: unknown;

	constructor(readonly child: Column, readonly aggregatorType: FnType) {
		super();
		this.alias = null;
	}

	getName(): string {
		return `${this.aggregatorType}(${this.child.getName()})`;
	}

	getNormalizedName(): string {
		return `${this.aggregatorType}(${this.child.getNormalizedName()})`;
	}

	getTable(): BaseTable {
		return this.child.getTable() as BaseTable;
	}

	override toString(): string {
		return this.getNormalizedName();
	}

	getType(): Type {
		return this.child.getType();
	}

	getAlias(): string {
		return this.alias;
	}

	getIndices(): Index[] {
		return [];
	}

	getIndex(): Index | null {
		return null;
	}

	isNullable(): boolean {
		return false;
	}

	isUnique(): boolean {
		return false;
	}

	as(name: string): this {
		this.alias = name;
		return this;
	}

	// Returns The chain of columns that starts from this column. All columns
	// are of type AggregatedColumn except for the last column.
	getColumnChain(): Column[] {
		const columnChain: Column[] = [this];
		let currentColumn: Column = this;
		while (currentColumn instanceof AggregatedColumn) {
			columnChain.push(currentColumn.child);
			currentColumn = currentColumn.child;
		}
		return columnChain;
	}
}

// Keep lower case class name for compatibility with Lovefield API.
// TODO(arthurhsu): FIXME: use public interface.
class op {
	static and(...predicates: Predicate[]): Predicate {
		return op.createPredicate(Operator.AND, predicates as PredicateNode[]);
	}

	static or(...predicates: Predicate[]): Predicate {
		return op.createPredicate(Operator.OR, predicates as PredicateNode[]);
	}

	static not(operand: Predicate): Predicate {
		operand.setComplement(true);
		return operand;
	}

	private static createPredicate(
		operator: Operator,
		predicates: PredicateNode[]
	): Predicate {
		const condition = new CombinedPredicate(operator);
		predicates.forEach((predicate) => {
			condition.addChild(predicate);
		});
		return condition;
	}
}

class SelectBuilder extends BaseBuilder<SelectContext> {
	private fromAlreadyCalled: boolean;
	private whereAlreadyCalled: boolean;

	constructor(
		private readonly backStore,
		private readonly schema,
		private readonly cache,
		private readonly indexStore,
		queryEngine,
		runner,
		columns: Column[]
	) {
		super(backStore, schema, cache, indexStore, queryEngine, runner, new SelectContext());
		this.fromAlreadyCalled = false;
		this.whereAlreadyCalled = false;
		this.query.columns = columns;
		this.checkDistinctColumn();
		this.checkAggregations();
	}

	override assertExecPreconditions(): void {
		super.assertExecPreconditions();
		const context = this.query;
		if (context.from === undefined || context.from === null) {
			// 522: Invalid usage of select().
			throw new Exception(ErrorCode.INVALID_SELECT);
		}

		if (
			context.limitBinder && context.limit === undefined
			|| context.skipBinder && context.skip === undefined
		) {
			// 523: Binding parameters of limit/skip without providing values.
			throw new Exception(ErrorCode.UNBOUND_LIMIT_SKIP);
		}

		this.checkProjectionList();
	}

	from(...tables: string[] | Table[]): this {
		if (
			tables.every((element) => {
				return typeof element === "string";
			})
		) {
			tables = tables.map((table) => {
				return this.schema.table(table);
			});
		}

		if (this.fromAlreadyCalled) {
			// 515: from() has already been called.
			throw new Exception(ErrorCode.DUPLICATE_FROM);
		}
		this.fromAlreadyCalled = true;

		if (this.query.from === undefined || this.query.from === null) {
			this.query.from = [];
		}

		this.query.from.push(...tables);
		return this;
	}

	where(predicate: Predicate): this {
		// 548: from() has to be called before where().
		this.checkFrom(ErrorCode.FROM_AFTER_WHERE);

		if (this.whereAlreadyCalled) {
			// 516: where() has already been called.
			throw new Exception(ErrorCode.DUPLICATE_WHERE);
		}
		this.whereAlreadyCalled = true;

		this.augmentWhereClause(predicate);
		return this;
	}

	limit(numberOfRows: Binder | number): this {
		if (this.query.limit !== undefined || this.query.limitBinder) {
			// 528: limit() has already been called.
			throw new Exception(ErrorCode.DUPLICATE_LIMIT);
		}
		if (numberOfRows instanceof Binder) {
			this.query.limitBinder = numberOfRows;
		} else {
			if (numberOfRows < 0) {
				// 531: Number of rows must not be negative for limit/skip.
				throw new Exception(ErrorCode.NEGATIVE_LIMIT_SKIP);
			}
			this.query.limit = numberOfRows;
		}
		return this;
	}

	skip(numberOfRows: Binder | number): this {
		if (this.query.skip !== undefined || this.query.skipBinder) {
			// 529: skip() has already been called.
			throw new Exception(ErrorCode.DUPLICATE_SKIP);
		}
		if (numberOfRows instanceof Binder) {
			this.query.skipBinder = numberOfRows;
		} else {
			if (numberOfRows < 0) {
				// 531: Number of rows must not be negative for limit/skip.
				throw new Exception(ErrorCode.NEGATIVE_LIMIT_SKIP);
			}
			this.query.skip = numberOfRows;
		}
		return this;
	}

	orderBy(column: Column, order?: Order): this {
		// 549: from() has to be called before orderBy() or groupBy().
		this.checkFrom(ErrorCode.FROM_AFTER_ORDER_GROUPBY);

		if (this.query.orderBy === undefined) {
			this.query.orderBy = [];
		}

		this.query.orderBy.push({
			"column": column,
			"order": order !== undefined && order !== null ? order : Order.ASC
		});
		return this;
	}

	groupBy(...columns: Column[]): this {
		// 549: from() has to be called before orderBy() or groupBy().
		this.checkFrom(ErrorCode.FROM_AFTER_ORDER_GROUPBY);

		if (this.query.groupBy) {
			// 530: groupBy() has already been called.
			throw new Exception(ErrorCode.DUPLICATE_GROUPBY);
		}
		if (this.query.groupBy === undefined) {
			this.query.groupBy = [];
		}

		this.query.groupBy.push(...columns);
		return this;
	}

	// Checks that usage of lf.fn.distinct() is correct. Specifically if an
	// lf.fn.distinct() column is requested, then it can't be combined with any
	// other column.
	private checkDistinctColumn(): void {
		const distinctColumns = this.query.columns.filter((column) => column instanceof AggregatedColumn
			&& column.aggregatorType === FnType.DISTINCT);

		const isValidCombination = distinctColumns.length === 0
			|| distinctColumns.length === 1 && this.query.columns.length === 1;

		if (!isValidCombination) {
			// 524: Invalid usage of lf.fn.distinct().
			throw new Exception(ErrorCode.INVALID_DISTINCT);
		}
	}

	// Checks that the combination of projection list is valid.
	// Specifically:
	// 1) If GROUP_BY is specified: grouped columns must be indexable.
	// 2) If GROUP_BY is not specified: Aggregate and non-aggregated columns can't
	//    be mixed (result does not make sense).
	private checkProjectionList(): void {
		this.query.groupBy ? this.checkGroupByColumns() : this.checkProjectionListNotMixed();
	}

	// Checks that grouped columns are indexable.
	private checkGroupByColumns(): void {
		const isInvalid = this.query.groupBy.some((column) => {
			const type = column.getType();
			return type === Type.OBJECT || type === Type.ARRAY_BUFFER;
		});

		if (isInvalid) {
			// 525: Invalid projection list or groupBy columns.
			throw new Exception(ErrorCode.INVALID_GROUPBY);
		}
	}

	// Checks that the projection list contains either only non-aggregated
	// columns, or only aggregated columns. See checkProjectionList_ for details.
	private checkProjectionListNotMixed(): void {
		const aggregatedColumnsExist = this.query.columns.some((column) => column instanceof AggregatedColumn);
		const nonAggregatedColumnsExist = this.query.columns.some((column) => !(column instanceof AggregatedColumn)) || this.query.columns.length === 0;

		if (aggregatedColumnsExist && nonAggregatedColumnsExist) {
			// 526: Invalid projection list: mixing aggregated with non-aggregated
			throw new Exception(ErrorCode.INVALID_PROJECTION);
		}
	}

	// Checks that the specified aggregations are valid, in terms of aggregation
	// type and column type.
	private checkAggregations(): void {
		this.query.columns.forEach((column) => {
			const isValidAggregation = !(column instanceof AggregatedColumn)
				|| this.isAggregationValid(column.aggregatorType, column.getType());

			if (!isValidAggregation) {
				// 527: Invalid aggregation detected: {0}.
				throw new Exception(ErrorCode.INVALID_AGGREGATION, column.getNormalizedName());
			}
		}, this);
	}

	// Checks if from() has already called.
	private checkFrom(code: ErrorCode): void {
		if (this.query.from === undefined || this.query.from === null) {
			throw new Exception(code);
		}
	}

	// Augments the where clause by AND with the given predicate.
	private augmentWhereClause(predicate: Predicate): void {
		if (this.query.where) {
			const newPredicate = op.and(predicate, this.query.where);
			this.query.where = newPredicate;
		} else {
			this.query.where = predicate;
		}
	}

	// Checks whether the user specified aggregations are valid.
	private isAggregationValid(
		aggregatorType: FnType,
		columnType: Type
	): boolean {
		switch (aggregatorType) {
			case FnType.COUNT:
			case FnType.DISTINCT:
				return true;
			case FnType.AVG:
			case FnType.GEOMEAN:
			case FnType.STDDEV:
			case FnType.SUM:
				return columnType === Type.NUMBER || columnType === Type.INTEGER;
			case FnType.MAX:
			case FnType.MIN:
				return (
					columnType === Type.NUMBER
					|| columnType === Type.INTEGER
					|| columnType === Type.STRING
					|| columnType === Type.DATE_TIME
				);
			default:
			// NOT REACHED
		}
		return false;
	}
}

abstract class RewritePass<T> {
	protected rootNode!: T;

	// Rewrites the query plan, returns (new) root after rewriting.
	abstract rewrite(rootNode: T, queryContext?: Context): T;
}

class LogicalQueryPlanNode extends TreeNode {
	constructor() {
		super();
	}
}

class SelectNode extends LogicalQueryPlanNode {
	constructor(readonly predicate: Predicate) {
		super();
	}

	override toString(): string {
		return `select(${this.predicate.toString()})`;
	}
}

class AndPredicatePass extends RewritePass<LogicalQueryPlanNode> {
	constructor() {
		super();
	}

	rewrite(
		rootNode: LogicalQueryPlanNode,
		context?: Context
	): LogicalQueryPlanNode {
		this.rootNode = rootNode;
		this.traverse(this.rootNode);
		return this.rootNode;
	}

	// Traverses the subtree that starts at the given node and rewrites it such
	// that all AND predicates are broken down to separate SelectNode instances.
	private traverse(rootNode: LogicalQueryPlanNode): void {
		if (rootNode instanceof SelectNode) {
			assert(rootNode.getChildCount() === 1, "SelectNode must have exactly one child.");

			const predicates = this.breakAndPredicate(rootNode.predicate as PredicateNode);
			const newNodes = this.createSelectNodeChain(predicates);
			TreeHelper.replaceNodeWithChain(rootNode, newNodes[0], newNodes[1]);

			if (rootNode === this.rootNode) {
				this.rootNode = newNodes[0];
			}
			rootNode = newNodes[0];
		}

		rootNode.getChildren().forEach((child) => {
			this.traverse(child);
		});
	}

	// Recursively breaks down an AND predicate to its components.
	// OR predicates are unaffected, as well as other types of predicates
	// (value/join).
	// Example: (a0 AND (a1 AND a2)) AND (b OR c) becomes
	//           a0 AND a1 AND a2 AND (b OR c) -> [a0, a1, a2, (b OR c)]
	private breakAndPredicate(predicate: PredicateNode): PredicateNode[] {
		if (predicate.getChildCount() === 0) {
			return [predicate];
		}

		const combinedPredicate = predicate as CombinedPredicate;
		if (combinedPredicate.operator !== Operator.AND) {
			return [predicate];
		}

		const predicates = combinedPredicate
			.getChildren()
			.slice()
			.map((childPredicate) => {
				combinedPredicate.removeChild(childPredicate);
				return this.breakAndPredicate(childPredicate as PredicateNode);
			});
		return ArrayHelper.flatten(predicates) as PredicateNode[];
	}

	private createSelectNodeChain(predicates: PredicateNode[]): LogicalQueryPlanNode[] {
		let parentNode: LogicalQueryPlanNode | null = null;
		let lastNode: LogicalQueryPlanNode | null = null;
		predicates.map((predicate, index) => {
			const node = new SelectNode(predicate);
			if (index === 0) {
				parentNode = node;
			} else {
				(lastNode as PredicateNode).addChild(node);
			}
			lastNode = node;
		}, this);

		return [
			parentNode as unknown as LogicalQueryPlanNode,
			lastNode as unknown as LogicalQueryPlanNode
		];
	}
}

class CrossProductNode extends LogicalQueryPlanNode {
	constructor() {
		super();
	}

	override toString(): string {
		return "cross_product";
	}
}

class CrossProductPass extends RewritePass<LogicalQueryPlanNode> {
	constructor() {
		super();
	}

	rewrite(
		rootNode: LogicalQueryPlanNode,
		queryContext: Context
	): LogicalQueryPlanNode {
		if ((queryContext as SelectContext).from.length < 3) {
			return rootNode;
		}

		this.rootNode = rootNode;
		this.traverse(this.rootNode);
		return this.rootNode;
	}

	private traverse(rootNode: LogicalQueryPlanNode): void {
		// If rootNode is a CrossProduct and has more than 2 children, break it down.
		// TODO(dpapad): This needs optimization, since the order chosen here
		// affects whether subsequent steps will be able to convert the
		// cross-product to a join.
		if (rootNode instanceof CrossProductNode) {
			while (rootNode.getChildCount() > 2) {
				const crossProduct = new CrossProductNode();
				for (let i = 0; i < 2; i++) {
					const child = rootNode.removeChildAt(0);
					crossProduct.addChild(child as LogicalQueryPlanNode);
				}
				rootNode.addChildAt(crossProduct, 0);
			}
		}

		rootNode.getChildren().forEach((child) => {
			this.traverse(child);
		});
	}
}

// Interface for all logical plan generators to implement. Generator objects are
// designed as a one-time use objects.
interface LogicalPlanGenerator {
	// Generates the logical plan tree. It is a no-op if called more than once.
	generate: () => LogicalQueryPlanNode;
}

// TODO(arthurhsu): this abstract base class is not necessary. Refactor to
// remove and simplify code structure.
abstract class BaseLogicalPlanGenerator<T extends Context> implements LogicalPlanGenerator {
	private rootNode: LogicalQueryPlanNode;

	constructor(protected query: T) {
		this.rootNode = null as unknown as LogicalQueryPlanNode;
	}

	generate(): LogicalQueryPlanNode {
		if (this.rootNode === null) {
			this.rootNode = this.generateInternal();
		}

		return this.rootNode;
	}

	abstract generateInternal(): LogicalQueryPlanNode;
}

// Rewrites the logical query plan such that the resulting logical query plan is
// faster to execute than the original "naive" plan.
class LogicalPlanRewriter implements LogicalPlanGenerator {
	constructor(
		private rootNode: LogicalQueryPlanNode,
		private readonly queryContext: Context,
		private readonly rewritePasses: RewritePass<LogicalQueryPlanNode>[]
	) { }

	generate(): LogicalQueryPlanNode {
		this.rewritePasses.forEach((rewritePass) => {
			this.rootNode = rewritePass.rewrite(this.rootNode, this.queryContext);
		}, this);
		return this.rootNode;
	}
}

class TableAccessNode extends LogicalQueryPlanNode {
	constructor(readonly table: Table) {
		super();
	}

	override toString(): string {
		const table = this.table as BaseTable;
		const postfix = table.getAlias() ? ` as ${table.getAlias()}` : "";
		return `table_access(${this.table.getName()}${postfix})`;
	}
}

class JoinNode extends LogicalQueryPlanNode {
	constructor(
		readonly predicate: JoinPredicate,
		readonly isOuterJoin: boolean
	) {
		super();
	}

	override toString(): string {
		return (
			`join(type: ${this.isOuterJoin ? "outer" : "inner"}, `
			+ `${this.predicate.toString()})`
		);
	}
}

class ImplicitJoinsPass extends RewritePass<LogicalQueryPlanNode> {
	constructor() {
		super();
	}

	rewrite(
		rootNode: LogicalQueryPlanNode,
		context: Context
	): LogicalQueryPlanNode {
		const queryContext = context as SelectContext;
		if (queryContext.from.length < 2) {
			return rootNode;
		}

		this.rootNode = rootNode;
		this.traverse(this.rootNode, queryContext);
		return this.rootNode;
	}

	private traverse(
		rootNode: LogicalQueryPlanNode,
		queryContext: SelectContext
	): void {
		if (
			rootNode instanceof SelectNode
			&& rootNode.predicate instanceof JoinPredicate
		) {
			assert(rootNode.getChildCount() === 1, "SelectNode must have exactly one child.");
			const predicateId = rootNode.predicate.getId();

			const child = rootNode.getChildAt(0);
			if (child instanceof CrossProductNode) {
				const isOuterJoin = queryContext.outerJoinPredicates
					&& queryContext.outerJoinPredicates.has(predicateId);
				const joinNode = new JoinNode(rootNode.predicate, isOuterJoin);
				TreeHelper.replaceChainWithNode(rootNode, child, joinNode);
				if (rootNode === this.rootNode) {
					this.rootNode = joinNode;
				}
				rootNode = joinNode;
			}
		}
		rootNode.getChildren().forEach((child) => {
			this.traverse(child, queryContext);
		});
	}
}

class LogicalQueryPlan {
	constructor(
		readonly rootNode: LogicalQueryPlanNode,
		readonly scope: Set<Table>
	) { }

	getRoot(): LogicalQueryPlanNode {
		return this.rootNode;
	}

	getScope(): Set<Table> {
		return this.scope;
	}
}

class PushDownSelectionsPass extends RewritePass<LogicalQueryPlanNode> {
	// A set of SelectNodes that have already been pushed down. This is necessary
	// to avoid re-visiting the same nodes (endless recursion).
	private readonly alreadyPushedDown: Set<TreeNode>;

	constructor() {
		super();
		this.alreadyPushedDown = new Set<TreeNode>();
	}

	rewrite(
		rootNode: LogicalQueryPlanNode,
		context: Context
	): LogicalQueryPlanNode {
		const queryContext = context as SelectContext;
		if (queryContext.where === undefined || queryContext.where === null) {
			// No predicates exist.
			return rootNode;
		}

		this.clear();
		this.rootNode = rootNode;
		this.traverse(this.rootNode, queryContext);
		this.clear();
		return this.rootNode;
	}

	// Clears any state in this rewrite pass, such that it can be re-used for
	// rewriting multiple trees.
	private clear(): void {
		this.alreadyPushedDown.clear();
	}

	private traverse(
		rootNode: LogicalQueryPlanNode,
		queryContext: SelectContext
	): void {
		const processChildren = (node: TreeNode) => {
			node.getChildren().forEach(processNodeRec);
		};

		const processNodeRec = (node: TreeNode) => {
			if (this.alreadyPushedDown.has(node)) {
				return;
			}
			if (!this.isCandidateNode(node)) {
				processChildren(node);
				return;
			}

			const selectNode = node as SelectNode;
			const selectNodeTables = selectNode.predicate.getTables();

			const shouldPushDownFn = (child: LogicalQueryPlanNode) => this.doesReferToTables(child, selectNodeTables);

			const newRoot = this.pushDownNodeRec(queryContext, selectNode, shouldPushDownFn);
			this.alreadyPushedDown.add(selectNode);
			if (newRoot !== selectNode) {
				if (newRoot.getParent() === null) {
					this.rootNode = newRoot;
				}
				processNodeRec(newRoot);
			}
			processChildren(selectNode);
		};

		processNodeRec(rootNode);
	}

	// Recursively pushes down a SelectNode until it can't be pushed any further
	// down. |shouldPushDown| is a function to be called for each child to
	// determine whether the node should be pushed down one level.
	// Returns the new root of the subtree that itself could not be pushed further
	// down.
	private pushDownNodeRec(
		queryContext: SelectContext,
		node: SelectNode,
		shouldPushDownFn: (n: TreeNode) => boolean
	): LogicalQueryPlanNode {
		let newRoot: SelectNode = node;

		if (this.shouldSwapWithChild(queryContext, node)) {
			newRoot = TreeHelper.swapNodeWithChild(node) as SelectNode;
			this.pushDownNodeRec(queryContext, node, shouldPushDownFn);
		} else if (this.shouldPushBelowChild(node)) {
			const newNodes: SelectNode[] = [];
			const cloneFn = (n: TreeNode): TreeNode => {
				const newNode = new SelectNode((n as SelectNode).predicate);
				newNodes.push(newNode);
				return newNode;
			};
			newRoot = TreeHelper.pushNodeBelowChild(node, shouldPushDownFn, cloneFn) as SelectNode;

			// Recursively pushing down the nodes that were just added to the tree as
			// a result of pushing down "node", if any.
			newNodes.forEach((newNode) => this.pushDownNodeRec(queryContext, newNode, shouldPushDownFn));
		}

		return newRoot;
	}

	// Whether the subtree that starts at root refers to all tables in the given
	// list.
	private doesReferToTables(
		root: LogicalQueryPlanNode,
		tables: Set<Table>
	): boolean {
		// Finding all tables that are involved in the subtree starting at the given
		// root.
		const referredTables = new Set<Table>();
		TreeHelper.getLeafNodes(root).forEach((tableAccessNode) => referredTables.add((tableAccessNode as TableAccessNode).table));

		if (root instanceof TableAccessNode) {
			referredTables.add(root.table);
		}

		return isSubset(referredTables, tables);
	}

	// Whether the given node is a candidate for being pushed down the tree.
	private isCandidateNode(node: TreeNode): boolean {
		return node instanceof SelectNode;
	}

	// Whether an attempt should be made to push the given node below its only
	// child.
	private shouldPushBelowChild(node: TreeNode): boolean {
		const child = node.getChildAt(0);
		return child instanceof CrossProductNode || child instanceof JoinNode;
	}

	// Whether the given node should be swapped with its only child.
	private shouldSwapWithChild(
		queryContext: SelectContext,
		node: SelectNode
	): boolean {
		const child = node.getChildAt(0);
		if (!(child instanceof SelectNode)) {
			return false;
		}

		if (
			queryContext.outerJoinPredicates === undefined
			|| queryContext.outerJoinPredicates === null
		) {
			return true;
		}
		const nodeIsJoin = node.predicate instanceof JoinPredicate;
		const childIsOuterJoin = queryContext.outerJoinPredicates.has(child.predicate.getId());
		// If the node corresponds to a join predicate (outer or inner), allow it to
		// be pushed below any other SelectNode. If the node does not correspond to
		// a join predicate don't allow it to be pushed below an outer join, because
		// it needs to be applied after the outer join is calculated.
		return nodeIsJoin || !childIsOuterJoin;
	}
}

class AggregationNode extends LogicalQueryPlanNode {
	constructor(readonly columns: AggregatedColumn[]) {
		super();
	}

	override toString(): string {
		return `aggregation(${this.columns.toString()})`;
	}
}

class GroupByNode extends LogicalQueryPlanNode {
	constructor(readonly columns: Column[]) {
		super();
	}

	override toString(): string {
		return `group_by(${this.columns.toString()})`;
	}
}

class LimitNode extends LogicalQueryPlanNode {
	constructor(readonly limit: number) {
		super();
	}

	override toString(): string {
		return `limit(${this.limit})`;
	}
}

class OrderByNode extends LogicalQueryPlanNode {
	constructor(readonly orderBy: SelectContextOrderBy[]) {
		super();
	}

	override toString(): string {
		return `order_by(${SelectContext.orderByToString(this.orderBy)})`;
	}
}

class ProjectNode extends LogicalQueryPlanNode {
	constructor(readonly columns: Column[], readonly groupByColumns?: Column[]) {
		super();
	}

	override toString(): string {
		const columns = this.groupByColumns ? this.groupByColumns.map((col) => col.getNormalizedName()).join(", ") : "";
		const postfix = columns.length ? `, groupBy(${columns})` : "";
		return `project(${this.columns.toString()}${postfix})`;
	}
}

class SkipNode extends LogicalQueryPlanNode {
	constructor(readonly skip: number) {
		super();
	}

	override toString(): string {
		return `skip(${this.skip})`;
	}
}

class SelectLogicalPlanGenerator extends BaseLogicalPlanGenerator<SelectContext> {
	private tableAccessNodes: LogicalQueryPlanNode[];

	private crossProductNode: LogicalQueryPlanNode;

	private selectNode: LogicalQueryPlanNode;

	private groupByNode: LogicalQueryPlanNode;

	private aggregationNode: LogicalQueryPlanNode;

	private orderByNode: LogicalQueryPlanNode;

	private skipNode: LogicalQueryPlanNode;

	private limitNode: LogicalQueryPlanNode;

	private projectNode: LogicalQueryPlanNode;

	constructor(
		query: SelectContext,
		private readonly rewritePasses: RewritePass<LogicalQueryPlanNode>[]
	) {
		super(query);
		this.tableAccessNodes = null as unknown as LogicalQueryPlanNode[];
		this.crossProductNode = null as unknown as LogicalQueryPlanNode;
		this.selectNode = null as unknown as LogicalQueryPlanNode;
		this.groupByNode = null as unknown as LogicalQueryPlanNode;
		this.aggregationNode = null as unknown as LogicalQueryPlanNode;
		this.orderByNode = null as unknown as LogicalQueryPlanNode;
		this.skipNode = null as unknown as LogicalQueryPlanNode;
		this.limitNode = null as unknown as LogicalQueryPlanNode;
		this.projectNode = null as unknown as LogicalQueryPlanNode;
	}

	generateInternal(): LogicalQueryPlanNode {
		this.generateNodes();
		const rootNode = this.connectNodes();

		// Optimizing the "naive" logical plan.
		const planRewriter = new LogicalPlanRewriter(rootNode, this.query, this.rewritePasses);
		return planRewriter.generate();
	}

	// Generates all the nodes that will make up the logical plan tree. After
	// this function returns all nodes have been created, but they are not yet
	// connected to each other.
	private generateNodes(): void {
		this.generateTableAccessNodes();
		this.generateCrossProductNode();
		this.generateSelectNode();
		this.generateOrderByNode();
		this.generateSkipNode();
		this.generateLimitNode();
		this.generateGroupByNode();
		this.generateAggregationNode();
		this.generateProjectNode();
	}

	// Connects the nodes together such that the logical plan tree is formed.
	private connectNodes(): LogicalQueryPlanNode {
		const parentOrder = [
			this.limitNode,
			this.skipNode,
			this.projectNode,
			this.orderByNode,
			this.aggregationNode,
			this.groupByNode,
			this.selectNode,
			this.crossProductNode
		];

		let lastExistingParentIndex = -1;
		let rootNode: LogicalQueryPlanNode = null as unknown as LogicalQueryPlanNode;
		for (let i = 0; i < parentOrder.length; i++) {
			const node = parentOrder[i];
			if (node !== null) {
				if (rootNode === null) {
					rootNode = node;
				} else {
					parentOrder[lastExistingParentIndex].addChild(node);
				}
				lastExistingParentIndex = i;
			}
		}

		this.tableAccessNodes.forEach((tableAccessNode) => {
			parentOrder[lastExistingParentIndex].addChild(tableAccessNode);
		});

		return rootNode;
	}

	private generateTableAccessNodes(): void {
		this.tableAccessNodes = this.query.from.map((table) => new TableAccessNode(table));
	}

	private generateCrossProductNode(): void {
		if (this.query.from.length >= 2) {
			this.crossProductNode = new CrossProductNode();
		}
	}

	private generateSelectNode(): void {
		if (this.query.where) {
			this.selectNode = new SelectNode(this.query.where.copy());
		}
	}

	private generateOrderByNode(): void {
		if (this.query.orderBy) {
			this.orderByNode = new OrderByNode(this.query.orderBy);
		}
	}

	private generateSkipNode(): void {
		if (this.query.skip && this.query.skip > 0 || this.query.skipBinder) {
			this.skipNode = new SkipNode(this.query.skip);
		}
	}

	private generateLimitNode(): void {
		if (this.query.limit !== undefined && this.query.limit !== null) {
			this.limitNode = new LimitNode(this.query.limit);
		}
	}

	private generateGroupByNode(): void {
		if (this.query.groupBy) {
			this.groupByNode = new GroupByNode(this.query.groupBy);
		}
	}

	private generateAggregationNode(): void {
		const aggregatedColumns = this.query.columns.filter((column) => {
			return column instanceof AggregatedColumn;
		});

		if (this.query.orderBy) {
			this.query.orderBy.forEach((orderBy) => {
				if (orderBy.column instanceof AggregatedColumn) {
					aggregatedColumns.push(orderBy.column);
				}
			});
		}

		if (aggregatedColumns.length > 0) {
			this.aggregationNode = new AggregationNode(aggregatedColumns as AggregatedColumn[]);
		}
	}

	private generateProjectNode(): void {
		this.projectNode = new ProjectNode(this.query.columns || [], this.query.groupBy || null);
	}
}

// A factory used to create a logical query plan corresponding to a given query.
class LogicalPlanFactory {
	private readonly selectOptimizationPasses: RewritePass<LogicalQueryPlanNode>[];

	private readonly deleteOptimizationPasses: RewritePass<LogicalQueryPlanNode>[];

	constructor() {
		this.selectOptimizationPasses = [
			new AndPredicatePass(),
			new CrossProductPass(),
			new PushDownSelectionsPass(),
			new ImplicitJoinsPass()
		];

		this.deleteOptimizationPasses = [new AndPredicatePass()];
	}

	create(query: Context): LogicalQueryPlan {
		let generator: LogicalPlanGenerator = null as unknown as LogicalPlanGenerator;


		if (query instanceof SelectContext) {
			generator = new SelectLogicalPlanGenerator(query, this.selectOptimizationPasses);
		} else {
			// 513: Unknown query context.
			throw new Exception(ErrorCode.UNKNOWN_QUERY_CONTEXT);
		}

		const rootNode = generator.generate();
		return new LogicalQueryPlan(rootNode, query.getScope());
	}
}

// Pseudo table used for initializing pseudo columns.
class UnknownTable implements BaseTable {
	// Make TypeScript happy.
	[key: string]: unknown;

	private _alias: string;

	constructor() {
		this._alias = null as unknown as string;
	}

	getName(): string {
		return "#UnknownTable";
	}

	getColumns(): Column[] {
		return [];
	}

	getIndices(): Index[] {
		return [];
	}

	persistentIndex(): boolean {
		return false;
	}

	getAlias(): string {
		return this._alias;
	}

	getEffectiveName(): string {
		return this._alias || this.getName();
	}

	getRowIdIndexName(): string {
		return "#UnknownTable.#";
	}

	createRow(value?: object): Row {
		throw new Exception(ErrorCode.NOT_SUPPORTED);
	}

	deserializeRow(dbRecord: RawRow): Row {
		throw new Exception(ErrorCode.NOT_SUPPORTED);
	}

	as(alias: string): BaseTable {
		this._alias = alias;
		return this;
	}

	col(name: string): Column {
		return null as unknown as Column;
	}
}

//  A dummy Column implementation to be used as a substitute for '*',
// for example in COUNT(*).
class StarColumn extends NonPredicateProvider implements BaseColumn {
	// Make TypeScript happy.
	[key: string]: unknown;

	private readonly alias: string;

	private table: UnknownTable;

	constructor(alias?: string) {
		super();
		this.alias = alias || (null as unknown as string);
		this.table = new UnknownTable();
	}

	getName(): string {
		return "*";
	}

	getNormalizedName(): string {
		return this.getName();
	}

	override toString(): string {
		return this.getNormalizedName();
	}

	getTable(): BaseTable {
		// NOTE: The table here does not have a useful meaning, since the StarColumn
		// represents all columns that are available, which could be the result of a
		// join, therefore a dummy Table instance is used.
		return this.table;
	}

	getType(): Type {
		// NOTE: The type here does not have a useful meaning, since the notion of a
		// type does not apply to a collection of all columns (which is what this
		// class represents).
		return Type.NUMBER;
	}

	getAlias(): string {
		return this.alias;
	}

	getIndices(): Index[] {
		return [];
	}

	getIndex(): Index | null {
		return null;
	}

	isNullable(): boolean {
		return false;
	}

	isUnique(): boolean {
		return false;
	}

	as(alias: string): StarColumn {
		const clone = new StarColumn(alias);
		clone.table = this.table;
		return clone;
	}
}

type AggregatorValueType = Date | number | string | null;

class AggregationCalculator {
	constructor(
		private readonly relation: Relation,
		private readonly columns: AggregatedColumn[]
	) { }

	// Calculates all requested aggregations. Results are stored within
	// this.relation.
	calculate(): void {
		this.columns.forEach((column) => {
			const reverseColumnChain = column.getColumnChain().reverse();
			for (let i = 1; i < reverseColumnChain.length; i++) {
				const currentColumn = reverseColumnChain[i] as AggregatedColumn;
				const leafColumn = currentColumn.getColumnChain().slice(-1)[0];
				const inputRelation = this.getInputRelationFor(currentColumn);

				// Return early if the aggregation result has already been calculated.
				if (inputRelation.hasAggregationResult(currentColumn)) {
					return;
				}

				const result = this.evalAggregation(currentColumn.aggregatorType, inputRelation, leafColumn);
				this.relation.setAggregationResult(currentColumn, result);
			}
		}, this);
	}

	// Returns the relation that should be used as input for calculating the
	// given aggregated column.
	private getInputRelationFor(column: AggregatedColumn): Relation {
		return column.child instanceof AggregatedColumn ? (this.relation.getAggregationResult(column.child) as Relation) : this.relation;
	}

	private evalAggregation(
		aggregatorType: FnType,
		relation: Relation,
		column: Column
	): AggregationResult {
		let result: AggregationResult = null as unknown as AggregationResult;

		switch (aggregatorType) {
			case FnType.MIN:
				result = this.reduce(relation, column, (s, v) => {
					const soFar = s as number;
					const value = v as number;
					return value < soFar ? value : soFar;
				}) as AggregationResult;
				break;
			case FnType.MAX:
				result = this.reduce(relation, column, (s, v) => {
					const soFar = s as number;
					const value = v as number;
					return value > soFar ? value : soFar;
				}) as AggregationResult;
				break;
			case FnType.DISTINCT:
				result = this.distinct(relation, column);
				break;
			case FnType.COUNT:
				result = this.count(relation, column);
				break;
			case FnType.SUM:
				result = this.sum(relation, column);
				break;
			case FnType.AVG: {
				const count = this.count(relation, column);
				if (count > 0) {
					result = (this.sum(relation, column) as number) / count;
				}
				break;
			}
			case FnType.GEOMEAN:
				result = this.geomean(relation, column) as AggregationResult;
				break;
			default:
				// Must be case of FnType.STDDEV.
				result = this.stddev(relation, column) as AggregationResult;
				break;
		}

		return result;
	}

	// Reduces the input relation to a single value. Null values are ignored.
	private reduce(
		relation: Relation,
		column: Column,
		reduceFn: (cur: unknown, v: unknown) => AggregatorValueType
	): AggregatorValueType {
		return relation.entries.reduce((soFar: AggregatorValueType, entry) => {
			const value = entry.getField(column) as AggregatorValueType;
			if (value === null) {
				return soFar;
			}
			return soFar === null ? value : reduceFn(soFar, value);
		}, null);
	}

	// Calculates the count of the given column for the given relation.
	// COUNT(*) returns count of all rows but COUNT(column) ignores nulls
	// in that column.
	private count(relation: Relation, column: Column): number {
		if (column instanceof StarColumn) {
			return relation.entries.length;
		}
		return relation.entries.reduce((soFar, entry) => {
			return soFar + (entry.getField(column) === null ? 0 : 1);
		}, 0);
	}

	// Calculates the sum of the given column for the given relation.
	// If all rows have only value null for that column, then null is returned.
	// If the table is empty, null is returned.
	private sum(relation: Relation, column: Column): number | string {
		return this.reduce(relation, column, (s, v) => {
			const soFar = s as number;
			const value = v as number;
			return value + soFar;
		}) as number;
	}

	// Calculates the standard deviation of the given column for the given
	// relation. If all rows have only value null for that column, then null is
	// returned. If the table is empty, null is returned.
	private stddev(relation: Relation, column: Column): number | null {
		const values: number[] = [];
		relation.entries.forEach((entry) => {
			const value = entry.getField(column);
			if (value !== null) {
				values.push(value as number);
			}
		});

		return values.length === 0 ? null : MathHelper.standardDeviation.apply(null, values);
	}

	// Calculates the geometrical mean of the given column for the given relation.
	// Zero values are ignored. If all values given are zero, or if the input
	// relation is empty, null is returned.
	private geomean(relation: Relation, column: Column): number | null {
		let nonZeroEntriesCount = 0;

		const reduced = relation.entries.reduce((soFar, entry) => {
			const value = entry.getField(column);
			if (value !== null && value !== 0) {
				nonZeroEntriesCount++;
				return soFar + Math.log(value as number);
			} else {
				return soFar;
			}
		}, 0);

		return nonZeroEntriesCount === 0 ? null : Math.E ** (reduced / nonZeroEntriesCount);
	}

	// Keeps only distinct entries with regards to the given column.
	private distinct(relation: Relation, column: Column): Relation {
		const distinctMap = new Map<unknown, RelationEntry>();

		relation.entries.forEach((entry) => {
			const value = entry.getField(column);
			distinctMap.set(value, entry);
		});

		return new Relation(Array.from(distinctMap.values()), relation.getTables());
	}
}

abstract class PhysicalQueryPlanNode extends TreeNode {
	static ANY = -1;

	constructor(
		private readonly numRelations: number,
		private readonly execType: ExecType
	) {
		super();
	}

	// Core logic of this node.
	// Length of |relations| is guaranteed to be consistent with
	// |this.numRelations|.
	abstract execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[];

	exec(journal?: Journal, context?: Context): Promise<Relation[]> {
		switch (this.execType) {
			case ExecType.FIRST_CHILD:
				return this.execFirstChild(journal, context);

			case ExecType.ALL:
				return this.execAllChildren(journal, context);

			default:
				// NO_CHILD
				return this.execNoChild(journal, context);
		}
	}

	override toString(): string {
		return "dummy_node";
	}

	// Returns a string representation of this node taking into account the given
	// context.
	toContextString(context: Context): string {
		return this.toString();
	}

	private assertInput(relations: Relation[]): void {
		assert(this.numRelations === PhysicalQueryPlanNode.ANY
			|| relations.length === this.numRelations);
	}

	private execNoChild(
		journal?: Journal,
		context?: Context
	): Promise<Relation[]> {
		return new Promise<Relation[]>((resolve) => {
			resolve(this.execInternal([], journal, context));
		});
	}

	private execFirstChild(
		journal?: Journal,
		context?: Context
	): Promise<Relation[]> {
		return (this.getChildAt(0) as PhysicalQueryPlanNode)
			.exec(journal, context)
			.then((results) => {
				this.assertInput(results);
				return this.execInternal(results, journal, context);
			});
	}

	private execAllChildren(
		journal?: Journal,
		context?: Context
	): Promise<Relation[]> {
		const promises = this.getChildren().map((child) => {
			return (child as PhysicalQueryPlanNode).exec(journal, context);
		});
		return Promise.all<Relation[]>(promises).then((results) => {
			const relations: Relation[] = [];
			results.forEach((result) => {
				result.forEach((res) => relations.push(res));
			});
			this.assertInput(relations);
			return this.execInternal(relations, journal, context);
		});
	}
}

class AggregationStep extends PhysicalQueryPlanNode {
	constructor(readonly aggregatedColumns: AggregatedColumn[]) {
		super(PhysicalQueryPlanNode.ANY, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		const columnNames = this.aggregatedColumns.map((column) => column.getNormalizedName());

		return `aggregation(${columnNames.toString()})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		relations.forEach((relation) => {
			const calculator = new AggregationCalculator(relation, this.aggregatedColumns);
			calculator.calculate();
		}, this);
		return relations;
	}
}

class CrossProductStep extends PhysicalQueryPlanNode {
	constructor() {
		super(2, ExecType.ALL);
	}

	override toString(): string {
		return "cross_product";
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		return this.crossProduct(relations[0], relations[1]);
	}

	// Calculates the cross product of two relations.
	private crossProduct(
		leftRelation: Relation,
		rightRelation: Relation
	): Relation[] {
		const combinedEntries: RelationEntry[] = [];

		const leftRelationTableNames = leftRelation.getTables();
		const rightRelationTableNames = rightRelation.getTables();
		leftRelation.entries.forEach((le) => {
			rightRelation.entries.forEach((re) => {
				const combinedEntry = RelationEntry.combineEntries(le, leftRelationTableNames, re, rightRelationTableNames);
				combinedEntries.push(combinedEntry);
			});
		});

		const srcTables = leftRelation
			.getTables()
			.concat(rightRelation.getTables());
		return [new Relation(combinedEntries, srcTables)];
	}
}

// Keep lower case class name for compatibility with Lovefield API.
class fn {
	static avg(col: Column): Column {
		return new AggregatedColumn(col, FnType.AVG);
	}

	static count(column?: Column): Column {
		const col: Column = column || new StarColumn();
		return new AggregatedColumn(col, FnType.COUNT);
	}

	static distinct(col: Column): Column {
		return new AggregatedColumn(col, FnType.DISTINCT);
	}

	static max(col: Column): Column {
		return new AggregatedColumn(col, FnType.MAX);
	}

	static min(col: Column): Column {
		return new AggregatedColumn(col, FnType.MIN);
	}

	static stddev(col: Column): Column {
		return new AggregatedColumn(col, FnType.STDDEV);
	}

	static sum(col: Column): Column {
		return new AggregatedColumn(col, FnType.SUM);
	}

	static geomean(col: Column): Column {
		return new AggregatedColumn(col, FnType.GEOMEAN);
	}
}

class GetRowCountStep extends PhysicalQueryPlanNode {
	constructor(private readonly indexStore: IndexStore, readonly table: Table) {
		super(0, ExecType.NO_CHILD);
	}

	override toString(): string {
		return `get_row_count(${this.table.getName()})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		const rowIdIndex = this.indexStore.get((this.table as BaseTable).getRowIdIndexName());
		const relation = new Relation([], [this.table.getName()]);
		relation.setAggregationResult(fn.count(), rowIdIndex.stats().totalRows);
		return [relation];
	}
}

class TableAccessFullStep extends PhysicalQueryPlanNode {
	constructor(
		private readonly indexStore: IndexStore,
		private readonly cache: Cache,
		readonly table: Table
	) {
		super(0, ExecType.NO_CHILD);
	}

	override toString(): string {
		let postfix = "";
		const table = this.table as BaseTable;
		if (table.getAlias()) {
			postfix = ` as ${table.getAlias()}`;
		}
		return `table_access(${this.table.getName()}${postfix})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		const table = this.table as BaseTable;
		const rowIds = this.indexStore.get(table.getRowIdIndexName()).getRange();

		return [
			Relation.fromRows(this.cache.getMany(rowIds), [
				table.getEffectiveName()
			])
		];
	}
}

// An optimization pass responsible for optimizing SELECT COUNT(*) queries,
// where no LIMIT, SKIP, WHERE or GROUP_BY appears.
class GetRowCountPass extends RewritePass<PhysicalQueryPlanNode> {
	constructor(private readonly indexStore: IndexStore) {
		super();
	}

	rewrite(
		rootNode: PhysicalQueryPlanNode,
		queryContext: SelectContext
	): PhysicalQueryPlanNode {
		this.rootNode = rootNode;
		if (!this.canOptimize(queryContext)) {
			return rootNode;
		}

		const tableAccessFullStep: TableAccessFullStep = TreeHelper.find(rootNode, (node) => node instanceof TableAccessFullStep)[0] as unknown as TableAccessFullStep;
		const getRowCountStep = new GetRowCountStep(this.indexStore, tableAccessFullStep.table);
		TreeHelper.replaceNodeWithChain(tableAccessFullStep, getRowCountStep, getRowCountStep);

		return this.rootNode;
	}

	private canOptimize(queryContext: SelectContext): boolean {
		const isDefAndNotNull = (v: unknown) => v !== null && v !== undefined;
		const isCandidate = queryContext.columns.length === 1
			&& queryContext.from.length === 1
			&& !isDefAndNotNull(queryContext.where)
			&& !isDefAndNotNull(queryContext.limit)
			&& !isDefAndNotNull(queryContext.skip)
			&& !isDefAndNotNull(queryContext.groupBy);

		if (isCandidate) {
			const column = queryContext.columns[0];
			return (
				column instanceof AggregatedColumn
				&& column.aggregatorType === FnType.COUNT
				&& column.child instanceof StarColumn
			);
		}

		return false;
	}
}

class GroupByStep extends PhysicalQueryPlanNode {
	constructor(private readonly groupByColumns: Column[]) {
		super(1, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		const columnNames = this.groupByColumns.map((column) => column.getNormalizedName());
		return `groupBy(${columnNames.toString()})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		ctx?: Context
	): Relation[] {
		return this.calculateGroupedRelations(relations[0]);
	}

	// Breaks down a single relation to multiple relations by grouping rows based
	// on the specified groupBy columns.
	private calculateGroupedRelations(relation: Relation): Relation[] {
		const groupMap = new MapSet<string, RelationEntry>();

		const getKey = (entry: RelationEntry) => {
			const keys = this.groupByColumns.map((column) => entry.getField(column));
			return keys.join(",");
		};

		relation.entries.forEach((entry) => groupMap.set(getKey(entry), entry));
		return groupMap.keys().map((key) => {
			return new Relation(groupMap.get(key), relation.getTables());
		});
	}
}

enum JoinAlgorithm {
	HASH = "hash",
	INDEX_NESTED_LOOP = "index_nested_loop",
	NESTED_LOOP = "nested_loop"
}

class JoinStep extends PhysicalQueryPlanNode {
	private algorithm: JoinAlgorithm;

	private indexJoinInfo: IndexJoinInfo;

	constructor(
		private readonly indexStore: IndexStore,
		private readonly cache: Cache,
		readonly predicate: JoinPredicate,
		readonly isOuterJoin: boolean
	) {
		super(2, ExecType.ALL);
		this.algorithm = this.predicate.evaluatorType === EvalType.EQ ? JoinAlgorithm.HASH : JoinAlgorithm.NESTED_LOOP;
		this.indexJoinInfo = null as unknown as IndexJoinInfo;
	}

	override toString(): string {
		return (
			`join(type: ${this.isOuterJoin ? "outer" : "inner"}, `
			+ `impl: ${this.algorithm}, ${this.predicate.toString()})`
		);
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		switch (this.algorithm) {
			case JoinAlgorithm.HASH:
				return [
					this.predicate.evalRelationsHashJoin(relations[0], relations[1], this.isOuterJoin)
				];
			case JoinAlgorithm.INDEX_NESTED_LOOP:
				return [
					this.predicate.evalRelationsIndexNestedLoopJoin(relations[0], relations[1], this.indexJoinInfo, this.cache)
				];
			default:
				// JoinAlgorithm.NESTED_LOOP
				return [
					this.predicate.evalRelationsNestedLoopJoin(relations[0], relations[1], this.isOuterJoin)
				];
		}
	}

	// Indicates that this JoinStep should be executed as an INDEX_NESTED_LOOP
	// join. |column| is the column whose index should be queried.
	markAsIndexJoin(column: Column): void {
		this.algorithm = JoinAlgorithm.INDEX_NESTED_LOOP;
		const index = this.indexStore.get((column as BaseColumn).getIndex().getNormalizedName());
		this.indexJoinInfo = {
			"index": index,
			"indexedColumn": column,
			"nonIndexedColumn":
				column === this.predicate.leftColumn ? this.predicate.rightColumn : this.predicate.leftColumn
		};
	}
}

// A dummy execution step that performs no actual work.
class NoOpStep extends PhysicalQueryPlanNode {
	constructor(private readonly relations: Relation[]) {
		super(PhysicalQueryPlanNode.ANY, ExecType.NO_CHILD);
	}

	override toString(): string {
		return `no_op_step(${this.relations[0].getTables().join(",")})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		return this.relations;
	}
}

// An optimization pass responsible for identifying JoinSteps that can be
// calculated as index nested loop joins. It transforms the tree by specifying
// the algorithm to use in such JoinSteps and also by eliminating
// TableAccessFullStep corresponding to the side of the join where the index
// will be used.
class IndexJoinPass extends RewritePass<PhysicalQueryPlanNode> {
	constructor() {
		super();
	}

	rewrite(
		rootNode: PhysicalQueryPlanNode,
		queryContext: SelectContext
	): PhysicalQueryPlanNode {
		this.rootNode = rootNode;

		if (!this.canOptimize(queryContext)) {
			return rootNode;
		}

		const joinSteps = TreeHelper.find(rootNode, (node) => node instanceof JoinStep) as JoinStep[];
		joinSteps.forEach(this.processJoinStep, this);

		return this.rootNode;
	}

	private canOptimize(queryContext: SelectContext): boolean {
		return queryContext.from.length > 1;
	}

	// Examines the given join step and decides whether it should be executed as
	// an index-join.
	private processJoinStep(joinStep: JoinStep): void {
		// Currently ONLY inner EQ join can be calculated using index join.
		if (
			joinStep.predicate.evaluatorType !== EvalType.EQ
			|| joinStep.isOuterJoin
		) {
			return;
		}

		// Finds which of the two joined columns corresponds to the given table.
		const getColumnForTable = (table: BaseTable): Column => {
			return table.getEffectiveName() === (
				joinStep.predicate.rightColumn.getTable() as BaseTable
			).getEffectiveName() ? joinStep.predicate.rightColumn : joinStep.predicate.leftColumn;
		};

		// Extracts the candidate indexed column for the given execution step node.
		const getCandidate = (executionStep: PhysicalQueryPlanNode): Column => {
			// In order to use and index for implementing a join, the entire relation
			// must be fed to the JoinStep, otherwise the index can't be used.
			if (!(executionStep instanceof TableAccessFullStep)) {
				return null as unknown as Column;
			}
			const candidateColumn = getColumnForTable(executionStep.table as BaseTable);
			return (candidateColumn as BaseColumn).getIndex() === null ? (null as unknown as Column) : candidateColumn;
		};

		const leftCandidate = getCandidate(joinStep.getChildAt(0) as PhysicalQueryPlanNode);
		const rightCandidate = getCandidate(joinStep.getChildAt(1) as PhysicalQueryPlanNode);

		if (leftCandidate === null && rightCandidate === null) {
			// None of the two involved columns can be used for an index join.
			return;
		}

		// TODO(dpapad): If both columns can be used, currently the right column is
		// preferred. A smarter decision is to use the column corresponding to the
		// bigger incoming relation, such that index accesses are minimized. Use
		// index stats to figure out the size of each relation.
		const chosenColumn = rightCandidate !== null ? rightCandidate : leftCandidate;

		joinStep.markAsIndexJoin(chosenColumn);
		const dummyRelation = new Relation([], [(chosenColumn.getTable() as BaseTable).getEffectiveName()]);
		joinStep.replaceChildAt(new NoOpStep([dummyRelation]), chosenColumn === leftCandidate ? 0 : 1);
	}
}

interface IndexKeyRangeCalculator {
	getKeyRangeCombinations: (
		queryContext: Context
	) => KeyRange[] | SingleKeyRange[];
}

class BoundedKeyRangeCalculator implements IndexKeyRangeCalculator {
	// The query context that was used for calculating the cached key range
	// combinations.
	private lastQueryContext: Context;

	// Caching the keyRange combinations such that they don't need to be
	// calculated twice, in the case where the same query context is used.
	private combinations: KeyRange[] | SingleKeyRange[];

	// |this.predicateMap| is a map where a key is the name of an indexed column
	// and the values are predicates IDs that correspond to that column. The IDs
	// are used to grab the actual predicates from the given query context, such
	// that this calculator can be re-used with different query contexts.
	constructor(
		private readonly indexSchema: IndexImpl,
		private readonly predicateMap: MapSet<string, number>
	) {
		this.lastQueryContext = null as unknown as Context;
		this.combinations = null as unknown as KeyRange[] | SingleKeyRange[];
	}

	getKeyRangeCombinations(queryContext: Context): KeyRange[] | SingleKeyRange[] {
		if (this.lastQueryContext === queryContext) {
			return this.combinations;
		}

		const keyRangeMap = this.calculateKeyRangeMap(queryContext);
		this.fillMissingKeyRanges(keyRangeMap);

		// If this IndexRangeCandidate refers to a single column index there is no
		// need to perform cartesian product, since there is only one dimension.
		this.combinations = this.indexSchema.columns.length === 1 ? Array.from(keyRangeMap.values())[0].getValues() : this.calculateCartesianProduct(this.getSortedKeyRangeSets(keyRangeMap));
		this.lastQueryContext = queryContext;

		return this.combinations;
	}

	// Builds a map where a key is an indexed column name and the value is
	// the SingleKeyRangeSet, created by considering all provided predicates.
	private calculateKeyRangeMap(queryContext: Context): Map<string, SingleKeyRangeSet> {
		const keyRangeMap = new Map<string, SingleKeyRangeSet>();

		Array.from(this.predicateMap.keys()).forEach((columnName) => {
			const predicateIds = this.predicateMap.get(columnName);
			const predicates = predicateIds.map((predicateId) => {
				return queryContext.getPredicate(predicateId);
			}, this) as (CombinedPredicate | ValuePredicate)[];
			let keyRangeSetSoFar = new SingleKeyRangeSet([SingleKeyRange.all()]);
			predicates.forEach((predicate) => {
				keyRangeSetSoFar = SingleKeyRangeSet.intersect(keyRangeSetSoFar, predicate.toKeyRange());
			});
			keyRangeMap.set(columnName, keyRangeSetSoFar);
		}, this);

		return keyRangeMap;
	}

	// Traverses the indexed columns in reverse order and fills in an "all"
	// SingleKeyRangeSet where possible in the provided map.
	// Example1: Assume that the indexed columns are ['A', 'B', 'C'] and A is
	// already bound, but B and C are unbound. Key ranges for B and C will be
	// filled in with an "all" key range.
	// Example2: Assume that the indexed columns are ['A', 'B', 'C', 'D'] and A, C
	// are already bound, but B and D are unbound. Key ranges only for D will be
	// filled in. In practice such a case will have already been rejected by
	// IndexRangeCandidate#isUsable and should never occur here.
	private fillMissingKeyRanges(keyRangeMap: Map<string, SingleKeyRangeSet>): void {
		const getAllKeyRange = () => new SingleKeyRangeSet([SingleKeyRange.all()]);
		for (let i = this.indexSchema.columns.length - 1; i >= 0; i--) {
			const column = this.indexSchema.columns[i];
			const keyRangeSet = keyRangeMap.get(column.schema.getName()) || null;
			if (keyRangeSet !== null) {
				break;
			}
			keyRangeMap.set(column.schema.getName(), getAllKeyRange());
		}
	}

	// Sorts the key range sets corresponding to this index's columns according to
	// the column order of the index schema.
	private getSortedKeyRangeSets(keyRangeMap: Map<string, SingleKeyRangeSet>): SingleKeyRangeSet[] {
		const sortHelper = new Map<string, number>();
		let priority = 0;
		this.indexSchema.columns.forEach((column) => {
			sortHelper.set(column.schema.getName(), priority);
			priority++;
		});

		const sortedColumnNames = Array.from(keyRangeMap.keys()).sort((a, b) => (sortHelper.get(a) || 0) - (sortHelper.get(b) || 0));

		return sortedColumnNames.map((columnName) => keyRangeMap.get(columnName));
	}

	// Finds the cartesian product of a collection of SingleKeyRangeSets.
	// |keyRangeSets| is a SingleKeyRangeSet at position i in the input array
	// corresponds to all possible values for the ith dimension in the
	// N-dimensional space (where N is the number of columns in the cross-column
	// index).
	// Returns the cross-column key range combinations.
	private calculateCartesianProduct(keyRangeSets: SingleKeyRangeSet[]): KeyRange[] {
		assert(keyRangeSets.length > 1, "Should only be called for cross-column indices.");

		const keyRangeSetsAsArrays = keyRangeSets.map((keyRangeSet) => keyRangeSet.getValues());
		return ArrayHelper.product(keyRangeSetsAsArrays);
	}
}

class IndexRangeCandidate {
	// The names of all columns that are indexed by this index schema.
	private readonly indexedColumnNames: Set<string>;

	// A map where a key is the name of an indexed column and the values are
	// predicates IDs that correspond to that column. It is initialized lazily,
	// only if a predicate that matches a column of this index schema is found.
	private predicateMap: MapSet<string, number> | null;

	// The calculator object to be used for generating key ranges based on a given
	// query context. This object will be used by the IndexRangeScanStep during
	// query execution. Initialized lazily.
	private keyRangeCalculator: IndexKeyRangeCalculator | null;

	constructor(
		private readonly indexStore: IndexStore,
		readonly indexSchema: IndexImpl
	) {
		this.indexedColumnNames = new Set<string>(this.indexSchema.columns.map((col) => col.schema.getName()));
		this.predicateMap = null;
		this.keyRangeCalculator = null;
	}

	// The predicates that were consumed by this candidate.
	getPredicateIds(): number[] {
		return this.predicateMap ? this.predicateMap.values() : [];
	}

	getKeyRangeCalculator(): IndexKeyRangeCalculator {
		assert(this.predicateMap !== null);

		if (this.keyRangeCalculator === null) {
			this.keyRangeCalculator = new BoundedKeyRangeCalculator(this.indexSchema, this.predicateMap);
		}
		return this.keyRangeCalculator;
	}

	// Finds which predicates are related to the index schema corresponding to
	// this IndexRangeCandidate.
	consumePredicates(predicates: ValuePredicate[]): void {
		predicates.forEach((predicate) => {
			// If predicate is a ValuePredicate there in only one referred column. If
			// predicate is an OR CombinedPredicate, then it must be referring to a
			// single column (enforced by isKeyRangeCompatible()).
			const columnName = predicate.getColumns()[0].getName();
			if (this.indexedColumnNames.has(columnName)) {
				if (this.predicateMap === null) {
					this.predicateMap = new MapSet<string, number>();
				}
				this.predicateMap.set(columnName, predicate.getId());
			}
		}, this);
	}

	// Whether this candidate can actually be used for an IndexRangeScanStep
	// optimization. Sometimes after building the candidate it turns out that it
	// cannot be used. For example consider a cross column index on columns
	// ['A', 'B'] and a query that only binds the key range of the 2nd
	// dimension B.
	isUsable(): boolean {
		if (this.predicateMap === null) {
			// If the map was never initialized, it means that no predicate matched
			// this index schema columns.
			return false;
		}

		let unboundColumnFound = false;
		let isUsable = true;
		this.indexSchema.columns.every((column) => {
			const isBound = this.predicateMap.has(column.schema.getName());
			if (unboundColumnFound && isBound) {
				isUsable = false;
				return false;
			}
			if (!isBound) {
				unboundColumnFound = true;
			}
			return true;
		}, this);

		return isUsable;
	}

	calculateCost(queryContext: Context): number {
		const combinations: Range[] = this.getKeyRangeCalculator().getKeyRangeCombinations(queryContext);
		const indexData = this.indexStore.get(this.indexSchema.getNormalizedName());

		return combinations.reduce((costSoFar: number, combination: Range) => {
			return costSoFar + indexData.cost(combination);
		}, 0);
	}
}

// The maximum percent of
// 1) values an EvalType.IN predicate can have or
// 2) children an OR CombinedPredicate can have
// to still be considered for leveraging an index, with respect to the total
// number of rows in the table.
// For each one of the values/children an index query will be performed, so the
// trade-off here is that too many index queries can be slower than simply doing
// a full table scan. This constant has been determined by trial and error.
const INDEX_QUERY_THRESHOLD_PERCENT = 0.02;
class IndexCostEstimator {
	constructor(
		private readonly indexStore: IndexStore,
		private readonly tableSchema: Table
	) { }

	chooseIndexFor(
		queryContext: Context,
		predicates: Predicate[]
	): IndexRangeCandidate | null {
		const candidatePredicates = predicates.filter(this.isCandidate, this);
		if (candidatePredicates.length === 0) {
			return null;
		}

		const indexRangeCandidates = this.generateIndexRangeCandidates(candidatePredicates as ValuePredicate[]);
		if (indexRangeCandidates.length === 0) {
			return null;
		}

		// If there is only one candidate there is no need to evaluate the cost.
		if (indexRangeCandidates.length === 1) {
			return indexRangeCandidates[0];
		}

		let minCost = Number.MAX_VALUE;
		return indexRangeCandidates.reduce((prev: IndexRangeCandidate | null, curr: IndexRangeCandidate) => {
			const cost = curr.calculateCost(queryContext);
			if (cost < minCost) {
				minCost = cost;
				return curr;
			}
			return prev;
		}, null);
	}

	// Returns the number of Index#getRange queries that can be performed faster
	// than scanning the entire table instead.
	private getIndexQueryThreshold(): number {
		const rowIdIndex = this.indexStore.get((this.tableSchema as BaseTable).getRowIdIndexName());
		return Math.floor(rowIdIndex.stats().totalRows * INDEX_QUERY_THRESHOLD_PERCENT);
	}

	private generateIndexRangeCandidates(predicates: ValuePredicate[]): IndexRangeCandidate[] {
		const indexSchemas = (
			this.tableSchema as BaseTable
		).getIndices() as IndexImpl[];
		return indexSchemas
			.map((indexSchema) => {
				const indexRangeCandidate = new IndexRangeCandidate(this.indexStore, indexSchema);
				indexRangeCandidate.consumePredicates(predicates);
				return indexRangeCandidate;
			}, this)
			.filter((indexRangeCandidate) => indexRangeCandidate.isUsable());
	}

	private isCandidate(predicate: Predicate): boolean {
		if (predicate instanceof ValuePredicate) {
			return this.isCandidateValuePredicate(predicate);
		} else if (predicate instanceof CombinedPredicate) {
			return this.isCandidateCombinedPredicate(predicate);
		} else {
			return false;
		}
	}

	private isCandidateCombinedPredicate(predicate: CombinedPredicate): boolean {
		if (!predicate.isKeyRangeCompatible()) {
			return false;
		}

		const predicateColumn = (predicate.getChildAt(0) as ValuePredicate).column;
		if (predicateColumn.getTable() !== this.tableSchema) {
			return false;
		}

		return predicate.getChildCount() <= this.getIndexQueryThreshold();
	}

	private isCandidateValuePredicate(predicate: ValuePredicate): boolean {
		if (
			!predicate.isKeyRangeCompatible()
			|| predicate.column.getTable() !== this.tableSchema
		) {
			return false;
		}

		if (
			predicate.evaluatorType === EvalType.IN
			&& (predicate.peek() as unknown[]).length > this.getIndexQueryThreshold()
		) {
			return false;
		}

		return true;
	}
}

class IndexRangeScanStep extends PhysicalQueryPlanNode {
	useLimit: boolean;

	useSkip: boolean;

	// |reverseOrder|: return the results in reverse index order.
	constructor(
		private readonly indexStore: IndexStore,
		public index: IndexImpl,
		public keyRangeCalculator: IndexKeyRangeCalculator,
		public reverseOrder: boolean
	) {
		super(0, ExecType.NO_CHILD);
		this.useLimit = false;
		this.useSkip = false;
	}

	override toString(): string {
		return (
			`index_range_scan(${this.index.getNormalizedName()}, ?, `
			+ (this.reverseOrder ? "reverse" : "natural")
			+ (this.useLimit ? ", limit:?" : "")
			+ (this.useSkip ? ", skip:?" : "")
			+ ")"
		);
	}

	override toContextString(context: SelectContext): string {
		let results = this.toString();
		const keyRanges = this.keyRangeCalculator.getKeyRangeCombinations(context);
		results = results.replace("?", keyRanges.toString());

		if (this.useLimit) {
			results = results.replace("?", context.limit.toString());
		}
		if (this.useSkip) {
			results = results.replace("?", context.skip.toString());
		}

		return results;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		ctx?: Context
	): Relation[] {
		const context = ctx as SelectContext;
		const keyRanges = this.keyRangeCalculator.getKeyRangeCombinations(context);
		const index = this.indexStore.get(this.index.getNormalizedName());
		let rowIds: number[];
		if (
			keyRanges.length === 1
			&& keyRanges[0] instanceof SingleKeyRange
			&& keyRanges[0].isOnly()
		) {
			rowIds = IndexHelper.slice(
				index.get(keyRanges[0].from as Key), false, // Single key will never reverse order.
				this.useLimit ? context.limit : undefined, this.useSkip ? context.skip : undefined
			);
		} else {
			rowIds = index.getRange(keyRanges, this.reverseOrder, this.useLimit ? context.limit : undefined, this.useSkip ? context.skip : undefined);
		}

		const rows = rowIds.map((rowId) => new Row(rowId, {}));

		return [Relation.fromRows(rows, [this.index.tableName])];
	}
}

class SelectStep extends PhysicalQueryPlanNode {
	constructor(readonly predicateId: number) {
		super(1, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		return "select(?)";
	}

	override toContextString(context: Context): string {
		const predicate = context.getPredicate(this.predicateId);
		return this.toString().replace("?", predicate.toString());
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		// context must be provided for SelectStep.
		const predicate = context.getPredicate(this.predicateId);
		return [predicate.eval(relations[0])];
	}
}

class TableAccessByRowIdStep extends PhysicalQueryPlanNode {
	constructor(private readonly cache: Cache, private readonly table: Table) {
		super(1, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		return `table_access_by_row_id(${this.table.getName()})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		ctx?: Context
	): Relation[] {
		return [
			Relation.fromRows(this.cache.getMany(relations[0].getRowIds()), [
				(this.table as BaseTable).getEffectiveName()
			])
		];
	}
}

//  An optimization pass that detects if there are any indices that can be used
// in order to avoid full table scan.
class IndexRangeScanPass extends RewritePass<PhysicalQueryPlanNode> {
	constructor(
		private readonly indexStore: IndexStore,
		private readonly cache: Cache
	) {
		super();
	}

	rewrite(
		rootNode: PhysicalQueryPlanNode,
		queryContext: Context
	): PhysicalQueryPlanNode {
		this.rootNode = rootNode;

		const tableAccessFullSteps = TreeHelper.find(rootNode, (node) => node instanceof TableAccessFullStep) as TableAccessFullStep[];
		tableAccessFullSteps.forEach((tableAccessFullStep) => {
			const selectStepsCandidates = this.findSelectSteps(tableAccessFullStep);
			if (selectStepsCandidates.length === 0) {
				return;
			}

			const costEstimator = new IndexCostEstimator(this.indexStore, tableAccessFullStep.table);
			const indexRangeCandidate = costEstimator.chooseIndexFor(queryContext, selectStepsCandidates.map((c) => queryContext.getPredicate(c.predicateId)));
			if (indexRangeCandidate === null) {
				// No SelectStep could be optimized for this table.
				return;
			}

			// Creating a temporary mapping from Predicate to SelectStep, such that
			// the predicates that can be replaced by an index-range scan can be
			// mapped back to SelectStep nodes.
			const predicateToSelectStepMap = new Map<number, SelectStep>();
			selectStepsCandidates.forEach((selectStep) => {
				predicateToSelectStepMap.set(selectStep.predicateId, selectStep);
			}, this);

			this.rootNode = this.replaceWithIndexRangeScanStep(indexRangeCandidate, predicateToSelectStepMap, tableAccessFullStep);
		}, this);

		return this.rootNode;
	}

	// Finds all the SelectStep instances that exist in the tree above the given
	// node and are eligible for optimization.
	private findSelectSteps(startNode: PhysicalQueryPlanNode): SelectStep[] {
		const selectSteps: SelectStep[] = [];
		let node = startNode.getParent();
		while (node) {
			if (node instanceof SelectStep) {
				selectSteps.push(node);
			} else if (node instanceof JoinStep) {
				// Stop searching if a join node is traversed.
				break;
			}
			node = node.getParent();
		}

		return selectSteps;
	}

	// Replaces all the SelectSteps that can be calculated by using the chosen
	// index with two new steps an IndexRangeScanStep and a
	// TableAccessByRowIdStep.
	private replaceWithIndexRangeScanStep(
		indexRangeCandidate: IndexRangeCandidate,
		predicateToSelectStepMap: Map<number, SelectStep>,
		tableAccessFullStep: TableAccessFullStep
	): PhysicalQueryPlanNode {
		const predicateIds = indexRangeCandidate.getPredicateIds();
		const selectSteps = predicateIds.map((predicateId) => {
			return predicateToSelectStepMap.get(predicateId);
		});
		selectSteps.forEach(TreeHelper.removeNode);

		const indexRangeScanStep = new IndexRangeScanStep(this.indexStore, indexRangeCandidate.indexSchema, indexRangeCandidate.getKeyRangeCalculator(), false /* reverseOrder */
		);
		const tableAccessByRowIdStep = new TableAccessByRowIdStep(this.cache, tableAccessFullStep.table);
		tableAccessByRowIdStep.addChild(indexRangeScanStep);
		TreeHelper.replaceNodeWithChain(tableAccessFullStep, tableAccessByRowIdStep, indexRangeScanStep);

		return indexRangeScanStep.getRoot() as PhysicalQueryPlanNode;
	}
}

class LimitStep extends PhysicalQueryPlanNode {
	constructor() {
		super(1, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		return "limit(?)";
	}

	override toContextString(context: SelectContext): string {
		return this.toString().replace("?", context.limit.toString());
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		// opt_context must be provided for LimitStep.
		relations[0].entries.splice((context as SelectContext).limit);
		return relations;
	}
}

class OrderByStep extends PhysicalQueryPlanNode {
	constructor(readonly orderBy: SelectContextOrderBy[]) {
		super(PhysicalQueryPlanNode.ANY, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		return `order_by(${SelectContext.orderByToString(this.orderBy)})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		if (relations.length === 1) {
			const distinctColumn = this.findDistinctColumn(relations[0]);

			// If such a column exists, sort the results of the lf.fn.distinct
			// aggregator instead, since this is what will be used in the returned
			// result.
			const relationToSort = distinctColumn === null ? relations[0] : (relations[0].getAggregationResult(distinctColumn) as Relation);

			relationToSort.entries.sort(this.entryComparatorFn.bind(this));
		} else {
			relations.sort(this.relationComparatorFn.bind(this));
		}
		return relations;
	}

	// Determines whether sorting is requested on a column that has been
	// aggregated with lf.fn.distinct (if any).
	private findDistinctColumn(relation: Relation): Column | null {
		let distinctColumn: Column | null = null;

		this.orderBy.every((entry) => {
			const tempDistinctColumn = fn.distinct(entry.column);
			if (relation.hasAggregationResult(tempDistinctColumn)) {
				distinctColumn = tempDistinctColumn;
				return false;
			}
			return true;
		}, this);
		return distinctColumn;
	}

	// Returns -1 if a should precede b, 1 if b should precede a, 0 if a and b
	// are determined to be equal.
	private comparator(
		getLeftPayload: (col: Column) => IndexableType,
		getRightPayload: (col: Column) => IndexableType
	): number {
		let order: Order;
		let leftPayload = null;
		let rightPayload = null;
		let comparisonIndex = -1;

		do {
			comparisonIndex++;
			const column = this.orderBy[comparisonIndex].column;
			order = this.orderBy[comparisonIndex].order;
			leftPayload = getLeftPayload(column);
			rightPayload = getRightPayload(column);
		} while (
			leftPayload === rightPayload
			&& comparisonIndex + 1 < this.orderBy.length
		);

		let result = leftPayload < rightPayload ? -1 : leftPayload > rightPayload ? 1 : 0;
		result = order === Order.ASC ? result : -result;
		return result;
	}

	private entryComparatorFn(lhs: RelationEntry, rhs: RelationEntry): number {
		// NOTE: Avoiding on purpose to create a getPayload(operand, column) method
		// here, and binding it once to lhs and once to rhs, because it turns out
		// that Function.bind() is significantly hurting performance (measured on
		// Chrome 40).
		return this.comparator((column) => lhs.getField(column) as IndexableType, (column) => rhs.getField(column) as IndexableType);
	}

	private relationComparatorFn(lhs: Relation, rhs: Relation): number {
		// NOTE: See NOTE in entryComparatorFn_ on why two separate functions are
		// passed in this.comparator_ instead of using one method and binding to lhs
		// and to rhs respectively.
		return this.comparator((column) => {
			// If relations are sorted based on a non-aggregated column, choose
			// the last entry of each relation as a representative row (same as
			// SQLite).
			return (
				column instanceof AggregatedColumn ? lhs.getAggregationResult(column) : lhs.entries[lhs.entries.length - 1].getField(column)
			) as IndexableType;
		}, (column) => {
			return (
				column instanceof AggregatedColumn ? rhs.getAggregationResult(column) : rhs.entries[rhs.entries.length - 1].getField(column)
			) as IndexableType;
		});
	}
}

class RelationTransformer {
	// Transforms a list of relations to a single relation. Each input relation is
	// transformed to a single entry on the final relation.
	// Note: Projection columns must include at least one aggregated column.
	// |relations|: The relations to be transformed.
	// |columns|: The columns to include in the transformed relation.
	static transformMany(relations: Relation[], columns: Column[]): Relation {
		const entries = relations.map((relation) => {
			const relationTransformer = new RelationTransformer(relation, columns);
			const singleEntryRelation = relationTransformer.getTransformed();
			return singleEntryRelation.entries[0];
		});

		return new Relation(entries, relations[0].getTables());
	}

	constructor(
		private readonly relation: Relation,
		private readonly columns: Column[]
	) { }

	// Calculates a transformed Relation based on the columns that are requested.
	// The type of the requested columns affect the output (non-aggregate only VS
	// aggregate and non-aggregate mixed up).
	getTransformed(): Relation {
		// Determine whether any aggregated columns have been requested.
		const aggregatedColumnsExist = this.columns.some((column) => column instanceof AggregatedColumn);

		return aggregatedColumnsExist ? this.handleAggregatedColumns() : this.handleNonAggregatedColumns();
	}

	// Generates the transformed relation for the case where the requested columns
	// include any aggregated columns.
	private handleAggregatedColumns(): Relation {
		// If the only aggregator that was used was DISTINCT, return the relation
		// corresponding to it.
		if (
			this.columns.length === 1
			&& (this.columns[0] as AggregatedColumn).aggregatorType === FnType.DISTINCT
		) {
			const distinctRelation: Relation = this.relation.getAggregationResult(this.columns[0]) as Relation;
			const newEntries = distinctRelation.entries.map((e) => {
				const newEntry = new RelationEntry(new Row(Row.DUMMY_ID, {}), this.relation.isPrefixApplied());
				newEntry.setField(this.columns[0], e.getField((this.columns[0] as AggregatedColumn).child));
				return newEntry;
			}, this);

			return new Relation(newEntries, []);
		}

		// Generate a new relation where there is only one entry, and within that
		// entry there is exactly one field per column.
		const entry = new RelationEntry(new Row(Row.DUMMY_ID, {}), this.relation.isPrefixApplied());
		this.columns.forEach((column) => {
			const value = column instanceof AggregatedColumn ? this.relation.getAggregationResult(column) : this.relation.entries[0].getField(column);
			entry.setField(column, value);
		}, this);

		return new Relation([entry], this.relation.getTables());
	}

	// Generates the transformed relation for the case where the requested columns
	// include only non-aggregated columns.
	private handleNonAggregatedColumns(): Relation {
		// Generate a new relation where each entry includes only the specified
		// columns.
		const transformedEntries: RelationEntry[] = new Array(this.relation.entries.length);
		const isPrefixApplied = this.relation.isPrefixApplied();

		this.relation.entries.forEach((entry, index) => {
			transformedEntries[index] = new RelationEntry(new Row(entry.row.id(), {}), isPrefixApplied);

			this.columns.forEach((column) => {
				transformedEntries[index].setField(column, entry.getField(column));
			}, this);
		}, this);

		return new Relation(transformedEntries, this.relation.getTables());
	}
}

class ProjectStep extends PhysicalQueryPlanNode {
	constructor(
		private readonly columns: Column[],
		private readonly groupByColumns: Column[]
	) {
		super(PhysicalQueryPlanNode.ANY, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		let postfix = "";
		if (this.groupByColumns) {
			const groupBy = this.groupByColumns
				.map((col) => col.getNormalizedName())
				.join(", ");
			postfix = `, groupBy(${groupBy})`;
		}
		return `project(${this.columns.toString()}${postfix})`;
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		if (relations.length === 0) {
			return [Relation.createEmpty()];
		} else if (relations.length === 1) {
			return [this.execNonGroupByProjection(relations[0])];
		} else {
			return [this.execGroupByProjection(relations)];
		}
	}

	// Returns whether any aggregators (either columns or groupBy) have been
	// specified.
	hasAggregators(): boolean {
		const hasAggregators = this.columns.some((column) => {
			return column instanceof AggregatedColumn;
		});
		return hasAggregators || this.groupByColumns !== null;
	}

	// Calculates the final relation for the case where GROUP_BY exists.
	private execGroupByProjection(relations: Relation[]): Relation {
		return RelationTransformer.transformMany(relations, this.columns);
	}

	// Calculates the final relation for the case where no GROUP_BY exists.
	private execNonGroupByProjection(relation: Relation): Relation {
		if (this.columns.length === 0) {
			return relation;
		}
		const relationTransformer = new RelationTransformer(relation, this.columns);
		return relationTransformer.getTransformed();
	}
}

class SkipStep extends PhysicalQueryPlanNode {
	constructor() {
		super(1, ExecType.FIRST_CHILD);
	}

	override toString(): string {
		return "skip(?)";
	}

	override toContextString(context: SelectContext): string {
		return this.toString().replace("?", context.skip.toString());
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		context?: Context
	): Relation[] {
		return [
			new Relation(relations[0].entries.slice((context as SelectContext).skip), relations[0].getTables())
		];
	}
}

class LimitSkipByIndexPass extends RewritePass<PhysicalQueryPlanNode> {
	constructor() {
		super();
	}

	rewrite(
		rootNode: PhysicalQueryPlanNode,
		queryContext: SelectContext
	): PhysicalQueryPlanNode {
		if (queryContext.limit === undefined && queryContext.skip === undefined) {
			// No LIMIT or SKIP exists.
			return rootNode;
		}

		const indexRangeScanStep = this.findIndexRangeScanStep(rootNode);
		if (indexRangeScanStep === null) {
			// No IndexRangeScanStep that can be leveraged was found.
			return rootNode;
		}

		const nodes: (LimitStep | SkipStep)[] = TreeHelper.find(rootNode, (node) => node instanceof LimitStep || node instanceof SkipStep) as (LimitStep | SkipStep)[];

		nodes.forEach((node) => {
			this.mergeToIndexRangeScanStep(node, indexRangeScanStep);
		}, this);

		return indexRangeScanStep.getRoot() as PhysicalQueryPlanNode;
	}

	// Merges a LimitStep or SkipStep to the given IndexRangeScanStep.
	private mergeToIndexRangeScanStep(
		node: LimitStep | SkipStep,
		indexRangeScanStep: IndexRangeScanStep
	): PhysicalQueryPlanNode {
		if (node instanceof LimitStep) {
			indexRangeScanStep.useLimit = true;
		} else {
			indexRangeScanStep.useSkip = true;
		}

		return TreeHelper.removeNode(node).parent as PhysicalQueryPlanNode;
	}

	// Finds any existing IndexRangeScanStep that can be leveraged to limit and
	// skip results.
	private findIndexRangeScanStep(rootNode: PhysicalQueryPlanNode): IndexRangeScanStep | null {
		const filterFn = (node: TreeNode) => {
			return node instanceof IndexRangeScanStep;
		};

		// LIMIT and SKIP needs to be executed after
		//  - projections that include either groupBy or aggregators,
		//  - joins/cross-products,
		//  - selections,
		//  - sorting
		// have been calculated. Therefore if such nodes exist this optimization can
		// not be applied.
		const stopFn = (node: TreeNode) => {
			const hasAggregators = node instanceof ProjectStep && node.hasAggregators();
			return (
				hasAggregators
				|| node instanceof OrderByStep
				|| node.getChildCount() !== 1
				|| node instanceof SelectStep
			);
		};

		const indexRangeScanSteps = TreeHelper.find(rootNode, filterFn, stopFn) as IndexRangeScanStep[];
		return indexRangeScanSteps.length > 0 ? indexRangeScanSteps[0] : null;
	}
}

class MultiIndexRangeScanStep extends PhysicalQueryPlanNode {
	constructor() {
		super(PhysicalQueryPlanNode.ANY, ExecType.ALL);
	}

	override toString(): string {
		return "multi_index_range_scan()";
	}

	execInternal(
		relations: Relation[],
		journal?: Journal,
		ctx?: Context
	): Relation[] {
		// Calculate a new Relation that includes the union of the entries of all
		// relations. All child relations must be including rows from the same
		// table.
		const entriesUnion = new Map<number, RelationEntry>();
		relations.forEach((relation) => {
			relation.entries.forEach((entry) => {
				entriesUnion.set(entry.row.id(), entry);
			});
		});
		const entries = Array.from(entriesUnion.values());
		return [new Relation(entries, relations[0].getTables())];
	}
}

// An optimization pass that detects if there are any OR predicates that
// 1) Refer to a single table.
// 2) Refer to multiple columns.
// 3) All referred columns  are indexed.
//
// If such predicates are found the tree is transformed to leverage indices.
// OR predicates that refer to a single column are already optimized by the
// previous optimization pass IndexRangeScanPass.
class MultiColumnOrPass extends RewritePass<PhysicalQueryPlanNode> {
	constructor(
		private readonly indexStore: IndexStore,
		private readonly cache: Cache
	) {
		super();
	}

	rewrite(
		rootNode: PhysicalQueryPlanNode,
		queryContext: Context
	): PhysicalQueryPlanNode {
		this.rootNode = rootNode;
		const orSelectSteps = this.findOrPredicates(queryContext);
		if (orSelectSteps.length === 0) {
			// No OR predicates exist, this optimization does not apply.
			return this.rootNode;
		}

		// In the presence of multiple candidate OR predicates currently the first
		// one that can leverage indices is chosen.
		// TODO(dpapad): Compare the index range scan cost for each of the
		// predicates and select the fastest one.
		let indexRangeCandidates: IndexRangeCandidate[] | null = null;
		let orSelectStep: SelectStep | null = null;
		let i = 0;
		do {
			orSelectStep = orSelectSteps[i++];
			indexRangeCandidates = this.findIndexRangeCandidates(orSelectStep, queryContext);
		} while (indexRangeCandidates === null && i < orSelectSteps.length);

		if (indexRangeCandidates === null) {
			return this.rootNode;
		}

		const tableAccessFullStep = this.findTableAccessFullStep(indexRangeCandidates[0].indexSchema.tableName);
		if (tableAccessFullStep === null) {
			// No TableAccessFullStep exists, an index is leveraged already, this
			// optimization does not apply.
			return this.rootNode;
		}

		this.rootNode = this.replaceWithIndexRangeScan(orSelectStep, tableAccessFullStep, indexRangeCandidates);
		return this.rootNode;
	}

	// Find SelectStep instances in the tree corresponding to OR predicates.
	private findOrPredicates(queryContext: Context): SelectStep[] {
		const filterFn = (node: TreeNode) => {
			if (!(node instanceof SelectStep)) {
				return false;
			}

			const predicate = queryContext.getPredicate(node.predicateId);
			return (
				predicate instanceof CombinedPredicate
				&& predicate.operator === Operator.OR
			);
		};

		return TreeHelper.find(this.rootNode, filterFn) as SelectStep[];
	}

	// Find the table access step corresponding to the given table, or null if
	// such a step does not exist.
	private findTableAccessFullStep(tableName: string): TableAccessFullStep | null {
		return (
			(TreeHelper.find(this.rootNode, (node) => node instanceof TableAccessFullStep
				&& node.table.getName() === tableName)[0] as TableAccessFullStep) || null
		);
	}

	// Returns the IndexRangeCandidates corresponding to the given multi-column
	// OR predicate. Null is returned if no indices can be leveraged for the
	// given predicate.
	private findIndexRangeCandidates(
		selectStep: SelectStep,
		queryContext: Context
	): IndexRangeCandidate[] | null {
		const predicate = queryContext.getPredicate(selectStep.predicateId) as PredicateNode;

		const tables = predicate.getTables();
		if (tables.size !== 1) {
			// Predicates which refer to more than one table are not eligible for this
			// optimization.
			return null;
		}

		const tableSchema = Array.from(tables.values())[0];
		const indexCostEstimator = new IndexCostEstimator(this.indexStore, tableSchema);

		let indexRangeCandidates: IndexRangeCandidate[] | null = null;
		const allIndexed = predicate.getChildren().every((childPredicate) => {
			const indexRangeCandidate = indexCostEstimator.chooseIndexFor(queryContext, [childPredicate as PredicateNode]);
			if (indexRangeCandidate !== null) {
				indexRangeCandidates === null ? indexRangeCandidates = [indexRangeCandidate] : indexRangeCandidates.push(indexRangeCandidate);
			}

			return indexRangeCandidate !== null;
		});

		return allIndexed ? indexRangeCandidates : null;
	}

	// Replaces the given SelectStep with a MultiIndexRangeScanStep
	// (and children).
	private replaceWithIndexRangeScan(
		selectStep: SelectStep,
		tableAccessFullStep: TableAccessFullStep,
		indexRangeCandidates: IndexRangeCandidate[]
	): PhysicalQueryPlanNode {
		const tableAccessByRowIdStep = new TableAccessByRowIdStep(this.cache, tableAccessFullStep.table);
		const multiIndexRangeScanStep = new MultiIndexRangeScanStep();
		tableAccessByRowIdStep.addChild(multiIndexRangeScanStep);

		indexRangeCandidates.forEach((candidate) => {
			const indexRangeScanStep = new IndexRangeScanStep(this.indexStore, candidate.indexSchema, candidate.getKeyRangeCalculator(), false /* reverseOrder */
			);
			multiIndexRangeScanStep.addChild(indexRangeScanStep);
		}, this);

		TreeHelper.removeNode(selectStep);
		TreeHelper.replaceNodeWithChain(tableAccessFullStep, tableAccessByRowIdStep, multiIndexRangeScanStep);

		return multiIndexRangeScanStep.getRoot() as PhysicalQueryPlanNode;
	}
}

class UnboundedKeyRangeCalculator implements IndexKeyRangeCalculator {
	constructor(private readonly indexSchema: IndexImpl) { }

	getKeyRangeCombinations(queryContext: Context): KeyRange[] | SingleKeyRange[] {
		return this.indexSchema.columns.length === 1 ? [SingleKeyRange.all()] : [this.indexSchema.columns.map(() => SingleKeyRange.all())];
	}
}

interface OrderByIndexRangeCandidate {
	indexSchema: IndexImpl;
	isReverse: boolean;
}

// The OrderByIndexPass is responsible for modifying a tree that has a
// OrderByStep node to an equivalent tree that leverages indices to perform
// sorting.
class OrderByIndexPass extends RewritePass<PhysicalQueryPlanNode> {
	constructor(
		private readonly indexStore: IndexStore,
		private readonly cache: Cache
	) {
		super();
	}

	rewrite(
		rootNode: PhysicalQueryPlanNode,
		queryContext: SelectContext
	): PhysicalQueryPlanNode {
		const orderByStep = this.findOrderByStep(rootNode, queryContext);
		if (orderByStep === null) {
			// No OrderByStep was found.
			return rootNode;
		}

		let newSubtreeRoot = this.applyTableAccessFullOptimization(orderByStep);
		if (newSubtreeRoot === orderByStep) {
			newSubtreeRoot = this.applyIndexRangeScanStepOptimization(orderByStep);
		}

		return newSubtreeRoot.getRoot() as PhysicalQueryPlanNode;
	}

	// Attempts to replace the OrderByStep with a new IndexRangeScanStep.
	private applyTableAccessFullOptimization(orderByStep: OrderByStep): PhysicalQueryPlanNode {
		let rootNode: PhysicalQueryPlanNode = orderByStep;

		const tableAccessFullStep = this.findTableAccessFullStep(orderByStep.getChildAt(0) as PhysicalQueryPlanNode);
		if (tableAccessFullStep !== null) {
			const indexRangeCandidate = this.findIndexCandidateForOrderBy(tableAccessFullStep.table as BaseTable, orderByStep.orderBy);

			if (indexRangeCandidate === null) {
				// Could not find an index schema that can be leveraged.
				return rootNode;
			}

			const indexRangeScanStep = new IndexRangeScanStep(this.indexStore, indexRangeCandidate.indexSchema, new UnboundedKeyRangeCalculator(indexRangeCandidate.indexSchema), indexRangeCandidate.isReverse);
			const tableAccessByRowIdStep = new TableAccessByRowIdStep(this.cache, tableAccessFullStep.table);
			tableAccessByRowIdStep.addChild(indexRangeScanStep);

			TreeHelper.removeNode(orderByStep);
			rootNode = TreeHelper.replaceNodeWithChain(tableAccessFullStep, tableAccessByRowIdStep, indexRangeScanStep) as PhysicalQueryPlanNode;
		}

		return rootNode;
	}

	// Attempts to replace the OrderByStep with an existing IndexRangeScanStep.
	private applyIndexRangeScanStepOptimization(orderByStep: OrderByStep): PhysicalQueryPlanNode {
		let rootNode: PhysicalQueryPlanNode = orderByStep;
		const indexRangeScanStep = this.findIndexRangeScanStep(orderByStep.getChildAt(0) as PhysicalQueryPlanNode);
		if (indexRangeScanStep !== null) {
			const indexRangeCandidate = this.getIndexCandidateForIndexSchema(indexRangeScanStep.index, orderByStep.orderBy);

			if (indexRangeCandidate === null) {
				return rootNode;
			}

			indexRangeScanStep.reverseOrder = indexRangeCandidate.isReverse;
			rootNode = TreeHelper.removeNode(orderByStep)
				.parent as PhysicalQueryPlanNode;
		}

		return rootNode;
	}

	// Finds any existing IndexRangeScanStep that can potentially be used to
	// produce the requested ordering instead of the OrderByStep.
	private findIndexRangeScanStep(rootNode: PhysicalQueryPlanNode): IndexRangeScanStep | null {
		const filterFn = (node: TreeNode) => node instanceof IndexRangeScanStep;

		// CrossProductStep/JoinStep/MultiIndexRangeScanStep nodes have more than
		// one child, and mess up the ordering of results. Therefore if such nodes
		// exist this optimization can not be applied.
		const stopFn = (node: TreeNode) => node.getChildCount() !== 1;

		const indexRangeScanSteps = TreeHelper.find(rootNode, filterFn, stopFn) as IndexRangeScanStep[];
		return indexRangeScanSteps.length > 0 ? indexRangeScanSteps[0] : null;
	}

	// Finds any existing TableAccessFullStep that can potentially be converted to
	// an IndexRangeScanStep instead of using an explicit OrderByStep.
	private findTableAccessFullStep(rootNode: PhysicalQueryPlanNode): TableAccessFullStep | null {
		const filterFn = (node: TreeNode) => node instanceof TableAccessFullStep;

		// CrossProductStep and JoinStep nodes have more than one child, and mess up
		// the ordering of results. Therefore if such nodes exist this optimization
		// can not be applied.
		const stopFn = (node: TreeNode) => node.getChildCount() !== 1;

		const tableAccessFullSteps = TreeHelper.find(rootNode, filterFn, stopFn) as TableAccessFullStep[];
		return tableAccessFullSteps.length > 0 ? tableAccessFullSteps[0] : null;
	}

	// Finds the OrderByStep if it exists in the tree.
	private findOrderByStep(
		rootNode: PhysicalQueryPlanNode,
		queryContext: SelectContext
	): OrderByStep | null {
		if (queryContext.orderBy === undefined) {
			// No ORDER BY exists.
			return null;
		}

		return TreeHelper.find(rootNode, (node) => node instanceof OrderByStep)[0] as OrderByStep;
	}

	private findIndexCandidateForOrderBy(
		tableSchema: BaseTable,
		orderBy: SelectContextOrderBy[]
	): OrderByIndexRangeCandidate | null {
		let indexCandidate: OrderByIndexRangeCandidate | null = null;

		const indexSchemas = tableSchema.getIndices() as IndexImpl[];
		for (let i = 0; i < indexSchemas.length && indexCandidate === null; i++) {
			indexCandidate = this.getIndexCandidateForIndexSchema(indexSchemas[i], orderBy);
		}

		return indexCandidate;
	}

	// Determines whether the given index schema can be leveraged for producing
	// the ordering specified by the given orderBy.
	private getIndexCandidateForIndexSchema(
		indexSchema: IndexImpl,
		orderBy: SelectContextOrderBy[]
	): OrderByIndexRangeCandidate | null {
		// First find an index schema which includes all columns to be sorted in the
		// same order.
		const columnsMatch = indexSchema.columns.length === orderBy.length
			&& orderBy.every((singleOrderBy, j) => {
				const indexedColumn = indexSchema.columns[j];
				return (
					singleOrderBy.column.getName() === indexedColumn.schema.getName()
				);
			});

		if (!columnsMatch) {
			return null;
		}

		// If columns match, determine whether the requested ordering within each
		// column matches the index, either in natural or reverse order.
		const isNaturalOrReverse = this.checkOrder(orderBy, indexSchema);

		if (!isNaturalOrReverse[0] && !isNaturalOrReverse[1]) {
			return null;
		}

		return {
			"indexSchema": indexSchema,
			"isReverse": isNaturalOrReverse[1]
		};
	}

	// Compares the order of each column in the orderBy and the indexSchema and
	// determines whether it is equal to the indexSchema 'natural' or 'reverse'
	// order.
	// Returns An array of 2 elements, where 1st element corresponds to isNatural
	// and 2nd to isReverse.
	private checkOrder(
		orderBy: SelectContextOrderBy[],
		indexSchema: IndexImpl
	): [boolean, boolean] {
		// Converting orderBy orders to a bitmask.
		const ordersLeftBitmask = orderBy.reduce((soFar, columnOrderBy) => {
			return soFar << 1 | (columnOrderBy.order === Order.DESC ? 0 : 1);
		}, 0);

		// Converting indexSchema orders to a bitmask.
		const ordersRightBitmask = indexSchema.columns.reduce((soFar, indexedColumn) => {
			return soFar << 1 | (indexedColumn.order === Order.DESC ? 0 : 1);
		}, 0);

		const xorBitmask = ordersLeftBitmask ^ ordersRightBitmask;
		const isNatural = xorBitmask === 0;
		const isReverse = xorBitmask === 2 ** Math.max(orderBy.length, indexSchema.columns.length) - 1;

		return [isNatural, isReverse];
	}
}

// Rewrites the logical query plan such that the resulting physical query plan
// is faster to calculate than the original "naive" plan.
class PhysicalPlanRewriter {
	constructor(
		private rootNode: PhysicalQueryPlanNode,
		private readonly queryContext: Context,
		private readonly rewritePasses: RewritePass<PhysicalQueryPlanNode>[]
	) { }

	// Rewrites the physical plan.
	generate(): PhysicalQueryPlanNode {
		this.rewritePasses.forEach((rewritePass) => {
			this.rootNode = rewritePass.rewrite(this.rootNode, this.queryContext);
		}, this);
		return this.rootNode;
	}
}

class PhysicalPlanFactory {
	private readonly selectOptimizationPasses: RewritePass<PhysicalQueryPlanNode>[];

	//private readonly deleteOptimizationPasses: RewritePass<PhysicalQueryPlanNode>[];

	constructor(private readonly indexStore, private readonly cache) {
		this.selectOptimizationPasses = [
			new IndexJoinPass(),
			new IndexRangeScanPass(indexStore, cache),
			new MultiColumnOrPass(indexStore, cache),
			new OrderByIndexPass(indexStore, cache),
			new LimitSkipByIndexPass(),
			new GetRowCountPass(indexStore)
		];

		//this.deleteOptimizationPasses = [new IndexRangeScanPass(global)];
	}

	create(
		logicalQueryPlan: LogicalQueryPlan,
		queryContext: Context
	): PhysicalQueryPlan {
		const logicalQueryPlanRoot = logicalQueryPlan.getRoot();

		if (
			logicalQueryPlanRoot instanceof ProjectNode
			|| logicalQueryPlanRoot instanceof LimitNode
			|| logicalQueryPlanRoot instanceof SkipNode
		) {
			return this.createPlan(logicalQueryPlan, queryContext, this.selectOptimizationPasses);
		}

		// Should never get here since all cases are handled above.
		// 8: Unknown query plan node.
		throw new Exception(ErrorCode.UNKNOWN_PLAN_NODE);
	}

	private createPlan(
		logicalPlan: LogicalQueryPlan,
		queryContext: Context,
		rewritePasses?: RewritePass<PhysicalQueryPlanNode>[]
	): PhysicalQueryPlan {
		let rootStep = TreeHelper.map(logicalPlan.getRoot(), this.mapFn.bind(this));

		if (rewritePasses !== undefined && rewritePasses !== null) {
			const planRewriter = new PhysicalPlanRewriter(rootStep, queryContext, rewritePasses);
			rootStep = planRewriter.generate();
		}
		return new PhysicalQueryPlan(rootStep, logicalPlan.getScope());
	}

	// Maps each node of a logical execution plan to a corresponding physical
	// execution step.
	private mapFn(node: LogicalQueryPlanNode): PhysicalQueryPlanNode {
		if (node instanceof ProjectNode) {
			return new ProjectStep(node.columns, node.groupByColumns);
		} else if (node instanceof GroupByNode) {
			return new GroupByStep(node.columns);
		} else if (node instanceof AggregationNode) {
			return new AggregationStep(node.columns);
		} else if (node instanceof OrderByNode) {
			return new OrderByStep(node.orderBy);
		} else if (node instanceof SkipNode) {
			return new SkipStep();
		} else if (node instanceof LimitNode) {
			return new LimitStep();
		} else if (node instanceof SelectNode) {
			return new SelectStep(node.predicate.getId());
		} else if (node instanceof CrossProductNode) {
			return new CrossProductStep();
		} else if (node instanceof JoinNode) {
			return new JoinStep(this.indexStore, this.cache, node.predicate, node.isOuterJoin);
		} else if (node instanceof TableAccessNode) {
			return new TableAccessFullStep(this.indexStore, this.cache, node.table);
		}

		// 514: Unknown node type.
		throw new Exception(ErrorCode.UNKNOWN_NODE_TYPE);
	}
}

class DefaultQueryEngine implements QueryEngine {
	private readonly logicalPlanFactory: LogicalPlanFactory;

	private readonly physicalPlanFactory: PhysicalPlanFactory;

	constructor(indexStore, cache) {
		this.logicalPlanFactory = new LogicalPlanFactory();
		this.physicalPlanFactory = new PhysicalPlanFactory(indexStore, cache);
	}

	getPlan(query: Context): PhysicalQueryPlan {
		const logicalQueryPlan = this.logicalPlanFactory.create(query);
		return this.physicalPlanFactory.create(logicalQueryPlan, query);
	}
}

class ExportTask extends UniqueId implements Task {
	private readonly scope: Set<Table>;

	private readonly resolver: Resolver<Relation[]>;

	constructor(
		private readonly schema: Schema,
		private readonly indexStore: IndexStore,
		private readonly cache: Cache
	) {
		super();
		this.scope = new Set<Table>(this.schema.tables());
		this.resolver = new Resolver<Relation[]>();
	}

	// Grabs contents from the cache and exports them as a plain object.
	execSync(): PayloadType {
		const tables: PayloadType = {};
		(this.schema.tables() as BaseTable[]).forEach((table) => {
			const rowIds = this.indexStore.get(table.getRowIdIndexName()).getRange();
			const payloads = this.cache
				.getMany(rowIds)
				.map((row) => row.payload());
			tables[table.getName()] = payloads;
		});

		return {
			"name": this.schema.name(),
			"tables": tables
		};
	}

	exec(): Promise<Relation[]> {
		const results = this.execSync();
		const entry = new RelationEntry(new Row(Row.DUMMY_ID, results), true);

		return Promise.resolve([new Relation([entry], [])]);
	}

	getType(): TransactionType {
		return TransactionType.READ_ONLY;
	}

	getScope(): Set<Table> {
		return this.scope;
	}

	getResolver(): Resolver<Relation[]> {
		return this.resolver;
	}

	getId(): number {
		return this.getUniqueNumber();
	}

	getPriority(): TaskPriority {
		return TaskPriority.EXPORT_TASK;
	}
}

class LockTableEntry {
	exclusiveLock: number | null;

	reservedReadWriteLock: number | null;

	reservedReadOnlyLocks: Set<number> | null;

	sharedLocks: Set<number> | null;

	constructor() {
		this.exclusiveLock = null;
		this.reservedReadWriteLock = null;
		this.reservedReadOnlyLocks = null;
		this.sharedLocks = null;
	}

	releaseLock(taskId: number): void {
		if (this.exclusiveLock === taskId) {
			this.exclusiveLock = null;
		}
		if (this.reservedReadWriteLock === taskId) {
			this.reservedReadWriteLock = null;
		}
		if (this.reservedReadOnlyLocks) {
			this.reservedReadOnlyLocks.delete(taskId);
		}
		if (this.sharedLocks) {
			this.sharedLocks.delete(taskId);
		}
	}

	canAcquireLock(taskId: number, lockType: LockType): boolean {
		const noReservedReadOnlyLocksExist = this.reservedReadOnlyLocks === null
			|| this.reservedReadOnlyLocks.size === 0;

		if (lockType === LockType.EXCLUSIVE) {
			const noSharedLocksExist = this.sharedLocks === null || this.sharedLocks.size === 0;
			return (
				noSharedLocksExist
				&& noReservedReadOnlyLocksExist
				&& this.exclusiveLock === null
				&& this.reservedReadWriteLock !== null
				&& this.reservedReadWriteLock === taskId
			);
		} else if (lockType === LockType.SHARED) {
			return (
				this.exclusiveLock === null
				&& this.reservedReadWriteLock === null
				&& this.reservedReadOnlyLocks !== null
				&& this.reservedReadOnlyLocks.has(taskId)
			);
		} else if (lockType === LockType.RESERVED_READ_ONLY) {
			return this.reservedReadWriteLock === null;
		} else {
			// case of lockType == lf.proc.LockType.RESERVED_READ_WRITE
			return (
				noReservedReadOnlyLocksExist
				&& (this.reservedReadWriteLock === null
					|| this.reservedReadWriteLock === taskId)
			);
		}
	}

	grantLock(taskId: number, lockType: LockType): void {
		if (lockType === LockType.EXCLUSIVE) {
			// TODO(dpapad): Assert that reserved lock was held by this taskId.
			this.reservedReadWriteLock = null;
			this.exclusiveLock = taskId;
		} else if (lockType === LockType.SHARED) {
			// TODO(dpapad): Assert that no other locked is held by this taskId and
			// that no reserved/exclusive locks exist.
			if (this.sharedLocks === null) {
				this.sharedLocks = new Set<number>();
			}
			this.sharedLocks.add(taskId);

			if (this.reservedReadOnlyLocks === null) {
				this.reservedReadOnlyLocks = new Set<number>();
			}
			this.reservedReadOnlyLocks.delete(taskId);
		} else if (lockType === LockType.RESERVED_READ_ONLY) {
			if (this.reservedReadOnlyLocks === null) {
				this.reservedReadOnlyLocks = new Set<number>();
			}
			this.reservedReadOnlyLocks.add(taskId);
		} else if (lockType === LockType.RESERVED_READ_WRITE) {
			// TODO(dpapad): Any other assertions here?
			this.reservedReadWriteLock = taskId;
		}
	}
}

// LockManager is responsible for granting locks to tasks. Each lock corresponds
// to a database table.
//
// Four types of locks exist in order to implement a two-phase locking
// algorithm.
// 1) RESERVED_READ_ONLY: Multiple such locks can be granted. It prevents any
//    RESERVED_READ_WRITE and EXCLUSIVE locks from being granted. It needs to be
//    acquired by any task that wants to eventually escalate it to a SHARED
//    lock.
// 2) SHARED: Multiple shared locks can be granted (meant to be used by
//    READ_ONLY tasks). Such tasks must be already holding a RESERVED_READ_ONLY
//    lock.
// 3) RESERVED_READ_WRITE: Granted to a single READ_WRITE task. It prevents
//    further SHARED, RESERVED_READ_ONLY and RESERVED_READ_WRITE locks to be
//    granted, but the underlying table should not be modified yet, until the
//    lock is escalated to an EXCLUSIVE lock.
// 4) EXCLUSIVE: Granted to a single READ_WRITE task. That task must already be
//    holding a RESERVED_READ_WRITE lock. It prevents further SHARED or
//    EXCLUSIVE locks to be granted. It is OK to modify a table while holding
//    such a lock.
class LockManager {
	private readonly lockTable: Map<string, LockTableEntry>;

	constructor() {
		this.lockTable = new Map<string, LockTableEntry>();
	}

	// Returns whether the requested lock was acquired.
	requestLock(
		taskId: number,
		dataItems: Set<Table>,
		lockType: LockType
	): boolean {
		const canAcquireLock = this.canAcquireLock(taskId, dataItems, lockType);
		if (canAcquireLock) {
			this.grantLock(taskId, dataItems, lockType);
		}
		return canAcquireLock;
	}

	releaseLock(taskId: number, dataItems: Set<Table>): void {
		dataItems.forEach((dataItem) => {
			this.getEntry(dataItem).releaseLock(taskId);
		});
	}

	// Removes any reserved locks for the given data items. This is needed in
	// order to prioritize a taskId higher than a taskId that already holds a
	// reserved lock.
	clearReservedLocks(dataItems: Set<Table>): void {
		dataItems.forEach((dataItem) => this.getEntry(dataItem).reservedReadWriteLock = null);
	}

	private getEntry(dataItem: Table): LockTableEntry {
		let lockTableEntry = this.lockTable.get(dataItem.getName()) || null;
		if (lockTableEntry === null) {
			lockTableEntry = new LockTableEntry();
			this.lockTable.set(dataItem.getName(), lockTableEntry);
		}
		return lockTableEntry;
	}

	private grantLock(
		taskId: number,
		dataItems: Set<Table>,
		lockType: LockType
	): void {
		dataItems.forEach((dataItem) => {
			this.getEntry(dataItem).grantLock(taskId, lockType);
		});
	}

	private canAcquireLock(
		taskId: number,
		dataItems: Set<Table>,
		lockType: LockType
	): boolean {
		let canAcquireLock = true;
		dataItems.forEach((dataItem) => {
			if (canAcquireLock) {
				const lockTableEntry = this.getEntry(dataItem);
				canAcquireLock = lockTableEntry.canAcquireLock(taskId, lockType);
			}
		}, this);
		return canAcquireLock;
	}
}

class TaskQueue {
	private readonly queue: Task[];

	constructor() {
		this.queue = [];
	}

	// Inserts a task to the queue.
	insert(task: Task): void {
		ArrayHelper.binaryInsert(this.queue, task, (t1: Task, t2: Task): number => {
			const priorityDiff = t1.getPriority() - t2.getPriority();
			return priorityDiff === 0 ? t1.getId() - t2.getId() : priorityDiff;
		});
	}

	// Returns a shallow copy of this queue.
	getValues(): Task[] {
		return this.queue.slice();
	}

	// Removes the given task from the queue. Returns true if the task were
	// removed, false if the task were not found.
	remove(task: Task): boolean {
		const i = this.queue.indexOf(task);
		if (i >= 0) {
			this.queue.splice(i, 1);
		}
		return i >= 0;
	}
}

// Query/Transaction runner which actually runs the query in a transaction
// (either implicit or explicit) on the back store.
class Runner {
	private readonly queue: TaskQueue;

	private readonly lockManager: LockManager;

	constructor() {
		this.queue = new TaskQueue();
		this.lockManager = new LockManager();
	}

	// Schedules a task for this runner.
	scheduleTask(task: Task): Promise<Relation[]> {
		if (
			task.getPriority() < TaskPriority.USER_QUERY_TASK
			|| task.getPriority() < TaskPriority.TRANSACTION_TASK
		) {
			// Any priority that is higher than USER_QUERY_TASK or TRANSACTION_TASK is
			// considered a "high" priority task and all held reserved locks should be
			// cleared to allow it to execute.
			this.lockManager.clearReservedLocks(task.getScope());
		}

		this.queue.insert(task);
		this.consumePending();
		return task.getResolver().promise;
	}

	// Examines the queue and executes as many tasks as possible taking into
	// account the scope of each task and the currently occupied scopes.
	private consumePending(): void {
		const queue = this.queue.getValues();

		queue.forEach((task) => {
			// Note: Iterating on a shallow copy of this.queue_, because this.queue_
			// will be modified during iteration and therefore iterating on
			// this.queue_ would not guarantee that every task in the queue will be
			// traversed.
			let acquiredLock = false;
			if (task.getType() === TransactionType.READ_ONLY) {
				acquiredLock = this.requestTwoPhaseLock(task, LockType.RESERVED_READ_ONLY, LockType.SHARED);
			} else {
				acquiredLock = this.requestTwoPhaseLock(task, LockType.RESERVED_READ_WRITE, LockType.EXCLUSIVE);
			}

			if (acquiredLock) {
				// Removing task from the task queue and executing it.
				this.queue.remove(task);
				this.execTask(task);
			}
		});
	}

	// Performs a two-phase lock acquisition. The 1st lock is requested first. If
	// it is granted, the 2nd lock is requested. Returns false if the 2nd lock was
	// not granted or both 1st and 2nd were not granted.
	private requestTwoPhaseLock(
		task: Task,
		lockType1: LockType,
		lockType2: LockType
	): boolean {
		let acquiredLock = false;
		const acquiredFirstLock = this.lockManager.requestLock(task.getId(), task.getScope(), lockType1);

		if (acquiredFirstLock) {
			// Escalating the first lock to the second lock.
			acquiredLock = this.lockManager.requestLock(task.getId(), task.getScope(), lockType2);
		}

		return acquiredLock;
	}

	// Executes a QueryTask. Callers of this method should have already acquired a
	// lock according to the task that is about to be executed.
	private execTask(task: Task): void {
		task
			.exec()
			.then(this.onTaskSuccess.bind(this, task), this.onTaskError.bind(this, task));
	}

	// Executes when a task finished successfully.
	private onTaskSuccess(task: Task, results: Relation[]): void {
		this.lockManager.releaseLock(task.getId(), task.getScope());
		task.getResolver().resolve(results);
		this.consumePending();
	}

	// Executes when a task finished with an error.
	private onTaskError(task: Task, error: Error): void {
		this.lockManager.releaseLock(task.getId(), task.getScope());
		task.getResolver().reject(error);
		this.consumePending();
	}
}

// The following states represent the life cycle of a transaction. These states
// are exclusive meaning that a tx can be only on one state at a given time.
enum TransactionState {
	CREATED = 0,
	ACQUIRING_SCOPE = 1,
	ACQUIRED_SCOPE = 2,
	EXECUTING_QUERY = 3,
	EXECUTING_AND_COMMITTING = 4,
	COMMITTING = 5,
	ROLLING_BACK = 6,
	FINALIZED = 7
}

class StateTransition {
	static get(): StateTransition {
		if (!StateTransition.instance) {
			StateTransition.instance = new StateTransition();
		}
		return StateTransition.instance;
	}

	private static instance: StateTransition;

	private readonly map: MapSet<TransactionState, TransactionState>;

	constructor() {
		this.map = new MapSet<TransactionState, TransactionState>();
		const TS = TransactionState;
		this.map.set(TS.CREATED, TS.ACQUIRING_SCOPE);
		this.map.set(TS.CREATED, TS.EXECUTING_AND_COMMITTING);
		this.map.set(TS.ACQUIRING_SCOPE, TS.ACQUIRED_SCOPE);
		this.map.set(TS.ACQUIRED_SCOPE, TS.EXECUTING_QUERY);
		this.map.set(TS.ACQUIRED_SCOPE, TS.COMMITTING);
		this.map.set(TS.ACQUIRED_SCOPE, TS.ROLLING_BACK);
		this.map.set(TS.EXECUTING_QUERY, TS.ACQUIRED_SCOPE);
		this.map.set(TS.EXECUTING_QUERY, TS.FINALIZED);
		this.map.set(TS.EXECUTING_AND_COMMITTING, TS.FINALIZED);
		this.map.set(TS.COMMITTING, TS.FINALIZED);
		this.map.set(TS.ROLLING_BACK, TS.FINALIZED);
	}

	get(current: TransactionState): Set<TransactionState> {
		return this.map.getSet(current);
	}
}

// A TransactionTask is used when the user explicitly starts a transaction and
// can execute queries within this transaction at will. A TransactionTask is
// posted to the Runner to ensure that all required locks have been acquired
// before any queries are executed. Any queries that are performed as part of a
// TransactionTask will not be visible to lf.proc.Runner at all (no
// corresponding QueryTask will be posted). Once the transaction is finalized,
// it will appear to the lf.proc.Runner that this task finished and all locks
// will be released, exactly as is done for any type of Task.
class TransactionTask extends UniqueId implements Task {
	private readonly scope: Set<Table>;

	private readonly journal: Journal;

	private readonly resolver: Resolver<Relation[]>;

	private readonly execResolver: Resolver<Relation[]>;

	private readonly acquireScopeResolver: Resolver<void>;

	private tx!: Tx;

	constructor(
		private readonly backStore,
		private readonly runner,
		private readonly schema,
		private readonly cache,
		private readonly indexStore,
		scope: Table[]
	) {
		super();
		this.scope = new Set<Table>(scope);
		this.journal = new Journal(this.schema, this.cache, this.indexStore, this.scope);
		this.resolver = new Resolver<Relation[]>();
		this.execResolver = new Resolver<Relation[]>();
		this.acquireScopeResolver = new Resolver<void>();
	}

	exec(): Promise<Relation[]> {
		this.acquireScopeResolver.resolve();
		return this.execResolver.promise;
	}

	getType(): TransactionType {
		return TransactionType.READ_WRITE;
	}

	getScope(): Set<Table> {
		return this.scope;
	}

	getResolver(): Resolver<Relation[]> {
		return this.resolver;
	}

	// Returns a unique number for this task.
	getId(): number {
		return this.getUniqueNumber();
	}

	// Returns the priority of this task.
	getPriority(): TaskPriority {
		return TaskPriority.TRANSACTION_TASK;
	}

	// Acquires all locks required such that this task can execute queries.
	acquireScope(): Promise<void> {
		this.runner.scheduleTask(this);
		return this.acquireScopeResolver.promise;
	}

	// Executes the given query without flushing any changes to disk yet.
	attachQuery(queryBuilder: QueryBuilder): Promise<object[]> {
		const taskItem = queryBuilder.getTaskItem();
		return taskItem.plan
			.getRoot()
			.exec(this.journal, taskItem.context)
			.then((relations) => {
				return relations[0].getPayloads();
			}, (e) => {
				this.journal.rollback();

				// Need to resolve execResolver here such that all locks acquired
				// by this transaction task are eventually released and avoid
				// unhandled rejected promise, which ends up in an unwanted
				// exception showing up in the console.
				this.execResolver.resolve();

				// Rethrows e so that caller's catch and reject handler will have
				// a chance to handle error instead of considering execution
				// success.
				throw e;
			});
	}

	commit(): Promise<Relation[]> {
		this.tx = this.backStore.createTx(this.getType(), Array.from(this.scope.values()), this.journal);
		this.tx.commit().then(() => {
			this.execResolver.resolve();
		}, (e) => {
			this.journal.rollback();
			this.execResolver.reject(e);
		});

		return this.resolver.promise;
	}

	rollback(): Promise<object[]> {
		this.journal.rollback();
		this.execResolver.resolve();
		return this.resolver.promise;
	}

	stats(): TransactionStatsImpl | null {
		let results: TransactionStatsImpl | null = null;
		if (this.tx) {
			results = this.tx.stats() as TransactionStatsImpl;
		}
		return results === null ? TransactionStatsImpl.getDefault() : results;
	}
}

interface Transaction {
	// Executes a list of queries and commits the transaction.
	exec: (queries: QueryBuilder[]) => Promise<unknown>;

	// Begins an explicit transaction. Returns a promise fulfilled when all
	// required locks have been acquired.
	//
	// |scope| are the tables that this transaction will be allowed to access.
	// An exclusive lock will be obtained on all tables before any queries
	// belonging to this transaction can be served.
	begin: (scope: Table[]) => Promise<void>;

	// Attaches |query| to an existing transaction and runs it.
	attach: (query: QueryBuilder) => Promise<unknown>;

	// Commits this transaction. Any queries that were performed will be flushed
	// to store.
	commit: () => Promise<unknown>;

	// Rolls back all changes that were made within this transaction. Rollback is
	// only allowed if the transaction has not been yet committed.
	rollback: () => Promise<unknown>;

	// Returns transaction statistics. This call will return meaningful value only
	// after a transaction is committed or rolled back. Read-only transactions
	// will have stats with success equals to true and all other counts as 0.
	stats: () => TransactionStats | null;
}

class RuntimeTransaction implements Transaction {
	private task: TransactionTask | UserQueryTask | null;

	private state: TransactionState;

	private readonly stateTransition: StateTransition;

	constructor(
		private readonly schema: Schema,
		private readonly cache: Cache,
		private readonly indexStore: IndexStore,
		private readonly backStore: BackStore,
		private readonly runner: Runner
	) {
		this.task = null;
		this.state = TransactionState.CREATED;
		this.stateTransition = StateTransition.get();
	}

	exec(queryBuilders: QueryBuilder[]): Promise<unknown> {
		this.updateState(TransactionState.EXECUTING_AND_COMMITTING);

		const taskItems: TaskItem[] = [];
		try {
			queryBuilders.forEach((queryBuilder) => {
				queryBuilder.assertExecPreconditions();
				taskItems.push(queryBuilder.getTaskItem());
			});
		} catch (e) {
			this.updateState(TransactionState.FINALIZED);
			return Promise.reject(e);
		}

		this.task = new UserQueryTask(this.backStore, this.schema, this.cache, this.indexStore, taskItems);
		return this.runner.scheduleTask(this.task).then((results) => {
			this.updateState(TransactionState.FINALIZED);
			return results.map((relation) => relation.getPayloads());
		}, (e) => {
			this.updateState(TransactionState.FINALIZED);
			throw e;
		});
	}

	begin(scope: BaseTable[]): Promise<void> {
		this.updateState(TransactionState.ACQUIRING_SCOPE);

		this.task = new TransactionTask(this.backStore, this.runner, this.schema, this.cache, this.indexStore, scope);
		return this.task.acquireScope().then(() => {
			this.updateState(TransactionState.ACQUIRED_SCOPE);
		});
	}

	attach(query: QueryBuilder): Promise<unknown> {
		this.updateState(TransactionState.EXECUTING_QUERY);

		try {
			query.assertExecPreconditions();
		} catch (e) {
			this.updateState(TransactionState.FINALIZED);
			return Promise.reject(e);
		}

		return (this.task as TransactionTask).attachQuery(query).then((result) => {
			this.updateState(TransactionState.ACQUIRED_SCOPE);
			return result;
		}, (e) => {
			this.updateState(TransactionState.FINALIZED);
			throw e;
		});
	}

	commit(): Promise<unknown> {
		this.updateState(TransactionState.COMMITTING);
		return (this.task as TransactionTask).commit().then((res) => {
			this.updateState(TransactionState.FINALIZED);
			return res;
		});
	}

	rollback(): Promise<unknown> {
		this.updateState(TransactionState.ROLLING_BACK);
		return (this.task as TransactionTask).rollback().then((res) => {
			this.updateState(TransactionState.FINALIZED);
			return res;
		});
	}

	stats(): TransactionStats | null {
		if (this.state !== TransactionState.FINALIZED) {
			// 105: Attempt to access in-flight transaction states.
			throw new Exception(ErrorCode.INVALID_TX_ACCESS);
		}
		return this.task.stats();
	}

	// Update this transaction from its current state to the given one.
	private updateState(newState: TransactionState): void {
		const nextStates = this.stateTransition.get(this.state);
		if (!nextStates.has(newState)) {
			// 107: Invalid transaction state transition: {0} -> {1}.
			throw new Exception(ErrorCode.INVALID_TX_STATE, this.state.toString(), newState.toString());
		} else {
			this.state = newState;
		}
	}
}

class DatabaseSchemaImpl implements Schema {
	private readonly tableMap: Map<string, Table>;

	constructor(readonly _name: string) {
		this.tableMap = new Map<string, Table>();
	}

	name(): string {
		return this._name;
	}

	tables(): Table[] {
		return Array.from(this.tableMap.values());
	}

	table(tableName: string): Table {
		const ret = this.tableMap.get(tableName);
		if (!ret) {
			// 101: Table {0} not found.
			throw new Exception(ErrorCode.TABLE_NOT_FOUND, tableName);
		}
		return ret;
	}

	setTable(table: Table): void {
		this.tableMap.set(table.getName(), table);
	}
}

function createPredicate<T>(
	lhs: Column,
	rhs: Column | T,
	type: EvalType
): Predicate {
	// For the case of .eq(null).
	if (rhs === null) {
		return new ValuePredicate(lhs, rhs, type);
	}

	const r = rhs as BaseColumn;
	if (r.getIndex && r.getIndices) {
		return new JoinPredicate(lhs, r, type);
	}

	// Value predicate, which can be bounded or not.
	return new ValuePredicate(lhs, rhs, type);
}

class ColumnImpl implements BaseColumn {
	readonly alias: string;

	[key: string]: unknown;

	private readonly indices: IndexImpl[];

	private index: IndexImpl;

	constructor(
		readonly table: BaseTable,
		readonly name: string,
		readonly unique: boolean,
		readonly nullable: boolean,
		readonly type: Type,
		alias?: string
	) {
		this.alias = alias || (null as unknown as string);
		this.indices = [];
		this.index = undefined as unknown as IndexImpl;
	}

	getName(): string {
		return this.name;
	}

	getNormalizedName(): string {
		return `${this.table.getEffectiveName()}.${this.name}`;
	}

	toString(): string {
		return this.getNormalizedName();
	}

	getTable(): BaseTable {
		return this.table;
	}

	getType(): Type {
		return this.type;
	}

	getAlias(): string {
		return this.alias;
	}

	isNullable(): boolean {
		return this.nullable;
	}

	isUnique(): boolean {
		return this.unique;
	}

	getIndices(): IndexImpl[] {
		(this.table.getIndices() as IndexImpl[]).forEach((index) => {
			const colNames = index.columns.map((col) => col.schema.getName());
			if (colNames.includes(this.name)) {
				this.indices.push(index);
			}
		});
		return this.indices;
	}

	getIndex(): IndexImpl {
		// Check of undefined is used purposefully here, such that this logic is
		// skipped if this.index has been set to null by a previous execution of
		// getIndex().
		if (this.index === undefined) {
			const indices = this.getIndices().filter((indexSchema) => {
				if (indexSchema.columns.length !== 1) {
					return false;
				}
				return indexSchema.columns[0].schema.getName() === this.name;
			});

			// Normally there should be only one dedicated index for this column,
			// but if there are more, just grab the first one.
			this.index = indices.length > 0 ? indices[0] : (null as unknown as IndexImpl);
		}
		return this.index;
	}

	eq(operand: OperandType): Predicate {
		return createPredicate(this, operand, EvalType.EQ);
	}

	neq(operand: OperandType): Predicate {
		return createPredicate(this, operand, EvalType.NEQ);
	}

	lt(operand: OperandType): Predicate {
		return createPredicate(this, operand, EvalType.LT);
	}

	lte(operand: OperandType): Predicate {
		return createPredicate(this, operand, EvalType.LTE);
	}

	gt(operand: OperandType): Predicate {
		return createPredicate(this, operand, EvalType.GT);
	}

	gte(operand: OperandType): Predicate {
		return createPredicate(this, operand, EvalType.GTE);
	}

	match(operand: Binder | RegExp): Predicate {
		return createPredicate(this, operand, EvalType.MATCH);
	}

	between(from: ValueOperandType, to: ValueOperandType): Predicate {
		return createPredicate(this, [from, to], EvalType.BETWEEN);
	}

	in(values: Binder | ValueOperandType[]): Predicate {
		return createPredicate(this, values, EvalType.IN);
	}

	isNull(): Predicate {
		return this.eq(null as unknown as OperandType);
	}

	isNotNull(): Predicate {
		return this.neq(null as unknown as OperandType);
	}

	as(name: string): Column {
		return new ColumnImpl(this.table, this.name, this.unique, this.nullable, this.type, name);
	}
}

interface IndexedColumn {
	schema: Column;
	order: Order;
	autoIncrement: boolean;
}

class IndexImpl implements Index {
	constructor(
		readonly tableName: string,
		readonly name: string,
		readonly isUnique: boolean,
		readonly columns: IndexedColumn[]
	) { }

	getNormalizedName(): string {
		return `${this.tableName}.${this.name}`;
	}

	// Whether this index refers to any column that is marked as nullable.
	hasNullableColumn(): boolean {
		return this.columns.some((column): boolean => column.schema.isNullable());
	}
}

class RowImpl extends Row {
	// UNUSED
	constructor(
		private readonly functionMap: Map<string, (payload: PayloadType) => Key>,
		private readonly columns: Column[],
		indices: Index[],
		id: number,
		payload?: PayloadType
	) {
		super(id, payload);

		// TypeScript forbids super to be called after this. Therefore we need
		// to duplicate this line from base class ctor because defaultPayload()
		// needs to know column information.
		this.payload_ = payload || this.defaultPayload();
	}

	override defaultPayload(): PayloadType {
		if (this.columns === undefined) {
			// Called from base ctor, ignore for now.
			return null as unknown as PayloadType;
		}

		const obj: PayloadType = {};
		this.columns.forEach((col) => {
			obj[col.getName()] = col.isNullable() ? null : DEFAULT_VALUES.get(col.getType());
		});
		return obj;
	}

	override toDbPayload(): PayloadType {
		const obj: PayloadType = {};
		this.columns.forEach((col) => {
			const key = col.getName();
			const type = col.getType();
			let value = this.payload()[key];
			if (type === Type.ARRAY_BUFFER) {
				value = value ? Row.binToHex(value as ArrayBuffer) : null;
			} else if (type === Type.DATE_TIME) {
				value = value ? (value as Date).getTime() : null;
			} else if (type === Type.OBJECT) {
				value = value || null;
			}
			obj[key] = value;
		});
		return obj;
	}

	override keyOfIndex(indexName: string): Key {
		const key = super.keyOfIndex(indexName);
		if (key === null) {
			const fn = this.functionMap.get(indexName);
			if (fn) {
				return fn(this.payload());
			}
		}
		return key;
	}
}

interface ColumnDef {
	name: string;
	type: Type;
	unique: boolean;
	nullable: boolean;
}

interface IndexedColumnSpec {
	name: string;
	order?: Order;
	autoIncrement?: boolean;
}

class TableImpl implements BaseTable {
	static ROW_ID_INDEX_PATTERN = "#";

	[key: string]: unknown;

	private static readonly EMPTY_INDICES: IndexImpl[] = [];

	private _alias: string;

	private readonly _columns: Column[];
	private readonly _functionMap: Map<string, (payload: PayloadType) => Key>;

	constructor(
		readonly _name: string,
		cols: ColumnDef[],
		private readonly _indices: IndexImpl[],
		readonly _usePersistentIndex: boolean,
		alias?: string
	) {
		this._columns = [];
		cols.forEach((col) => {
			const colSchema = new ColumnImpl(this, col.name, col.unique, col.nullable, col.type);
			this[col.name] = colSchema;
			this._columns.push(colSchema);
		}, this);
		this._functionMap = null as unknown as Map<
			string,
			(payload: PayloadType) => Key
		>;
		this._evalRegistry = EvalRegistry.get();
		this._alias = alias ? alias : (null as unknown as string);
	}

	getName(): string {
		return this._name;
	}

	getAlias(): string {
		return this._alias;
	}

	getEffectiveName(): string {
		return this._alias || this._name;
	}

	getIndices(): IndexImpl[] {
		return this._indices || TableImpl.EMPTY_INDICES;
	}

	getColumns(): Column[] {
		return this._columns;
	}

	persistentIndex(): boolean {
		return this._usePersistentIndex;
	}

	as(name: string): BaseTable {
		const colDef = this._columns.map((col) => {
			return {
				"name": col.getName(),
				"nullable": col.isNullable(),
				"type": col.getType(),
				"unique": col.isUnique()
			};
		});
		const clone = new TableImpl(this._name, colDef, this._indices, this._usePersistentIndex, name);
		clone._alias = name;
		return clone;
	}

	col(name: string): Column {
		return this[name] as Column;
	}

	getRowIdIndexName(): string {
		return `${this._name}.${TableImpl.ROW_ID_INDEX_PATTERN}`;
	}

	createRow(value?: PayloadType): Row {
		return new RowImpl(this._functionMap, this._columns, this._indices, Row.getNextId(), value);
	}

	deserializeRow(dbRecord: RawRow): Row {
		const obj: PayloadType = {};
		this._columns.forEach((col) => {
			const key = col.getName();
			const type = col.getType();
			let value: unknown = dbRecord.value[key];
			if (type === Type.ARRAY_BUFFER) {
				value = Row.hexToBin(value as string) as object;
			} else if (type === Type.DATE_TIME) {
				value = value !== null ? new Date(value as number) : null;
			}
			obj[key] = value;
		});
		return new RowImpl(this._functionMap, this._columns, this._indices, dbRecord.id, obj);
	}
}
class TableBuilder {
	private readonly name: string;

	private readonly columns: Map<string, Type>;

	private readonly uniqueColumns: Set<string>;

	private readonly uniqueIndices: Set<string>;

	private readonly nullable: Set<string>;

	private readonly indices: Map<string, IndexedColumnSpec[]>;

	private readonly persistIndex: boolean;

	constructor(tableName: string) {
		this.checkNamingRules(tableName);
		this.name = tableName;
		this.columns = new Map<string, Type>();
		this.uniqueColumns = new Set<string>();
		this.uniqueIndices = new Set<string>();
		this.nullable = new Set<string>();
		this.indices = new Map<string, IndexedColumnSpec[]>();
		this.persistIndex = false;
	}

	addColumn(name: string, type: Type): this {
		this.checkNamingRules(name);
		this.checkNameConflicts(name);
		this.columns.set(name, type);
		return this;
	}

	getSchema(): BaseTable {
		const columns: ColumnDef[] = Array.from(this.columns.keys()).map((colName) => {
			return {
				"name": colName,
				"nullable": this.nullable.has(colName) || false,
				"type": this.columns.get(colName) as unknown as Type,
				"unique": this.uniqueColumns.has(colName) || false
			};
		});

		// Pass null as indices since Columns are not really constructed yet.
		const table = new TableImpl(this.name, columns, null as unknown as IndexImpl[], this.persistIndex);

		return table;
	}

	private checkNamingRules(name: string): void {
		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
			// 502: Naming rule violation: {0}.
			throw new Exception(ErrorCode.INVALID_NAME, name);
		}
	}

	private checkNameConflicts(name: string): void {
		if (name === this.name) {
			// 546: Indices/constraints/columns can't re-use the table name {0}
			throw new Exception(ErrorCode.DUPLICATE_NAME, name);
		}

		if (
			this.columns.has(name)
			|| this.indices.has(name)
			|| this.uniqueIndices.has(name)
		) {
			// 503: Name {0} is already defined.
			throw new Exception(ErrorCode.NAME_IN_USE, `${this.name}.${name}`);
		}
	}
}

class Database {
	private readonly schema: DatabaseSchemaImpl;
	private readonly cache: DefaultCache;
	private readonly backStore: Memory;
	private readonly indexStore: MemoryIndexStore;
	private readonly queryEngine: DefaultQueryEngine;
	private readonly runner: Runner;

	public constructor(data) {
		this.schema = new DatabaseSchemaImpl("db");

		if (Array.isArray(data)) {
			data = { "table": data };
		}

		for (const [tableName, table] of Object.entries(data)) {
			const tableBuilder = new TableBuilder(tableName);

			for (const [columnName, value] of (table as object[]).length > 0 ? Object.entries(table[0]) : []) {
				let type;

				switch (Object.prototype.toString.call(value).slice(8, -1)) {
					case "ArrayBuffer":
						type = Type.ARRAY_BUFFER;
						break;
					case "Boolean":
						type = Type.BOOLEAN;
						break;
					case "Date":
						type = Type.DATE_TIME;
						break;
					case "Number":
						type = Type.NUMBER;
						break;
					case "String":
						type = Type.STRING;
						break;
					default:
						type = Type.OBJECT;
						break;
				}

				tableBuilder.addColumn(columnName, type);
			}

			this.schema.setTable(tableBuilder.getSchema());
		}

		this.cache = new DefaultCache(this.schema);
		this.backStore = new Memory(this.schema);
		this.indexStore = new MemoryIndexStore();
		this.indexStore.init(this.schema); // FIXME: This is async
		this.queryEngine = new DefaultQueryEngine(this.indexStore, this.cache);
		this.runner = new Runner();

		this.import(data);
	}

	// FROM: class DatabaseSchemaImpl

	tables(): Table[] {
		return Array.from(this.schema.tableMap.values());
	}

	table(tableName: string): Table {
		const ret = this.schema.tableMap.get(tableName);
		if (!ret) {
			// 101: Table {0} not found.
			throw new Exception(ErrorCode.TABLE_NOT_FOUND, tableName);
		}
		return ret;
	}

	setTable(table: Table): void {
		this.schema.tableMap.set(table.getName(), table);
	}

	// FROM: class RuntimeDatabase

	public select(...columns: Column[]): SelectQuery {
		return new SelectBuilder(this.backStore, this.schema, this.cache, this.indexStore, this.queryEngine, this.runner, columns);
	}

	public createTransaction(): Transaction {
		return new RuntimeTransaction(this.schema, this.cache, this.indexStore, this.backStore, this.runner);
	}

	public export(): Promise<object> {
		const task = new ExportTask(this.schema, this.indexStore, this.cache);

		return this.runner.scheduleTask(task).then((results) => {
			return results[0].getPayloads()[0];
		});
	}

	private import(data: object): Promise<object[]> {
		const scope = new Set<Table>(this.schema.tables());

		const transaction = this.backStore.createTx(TransactionType.READ_WRITE, Array.from(scope.values()), new Journal(this.schema, this.cache, this.indexStore, scope));

		for (const [tableName, tableData] of Object.entries(data)) {
			const tableSchema = this.schema.table(tableName) as BaseTable;
			const payloads = tableData as PayloadType[];
			const rows = payloads.map((value: object) => tableSchema.createRow(value));

			const table = transaction.getTable(tableName, tableSchema.deserializeRow, TableType.DATA);
			this.cache.setMany(tableName, rows);
			const indices = this.indexStore.getTableIndices(tableName);

			for (const row of rows) {
				for (const index of indices) {
					const key = row.keyOfIndex(index.getName());
					index.add(key, row.id());
				}
			}

			table.put(rows);
		}

		return transaction.commit() as Promise<Relation[]>;
	}
}

export function query(objects) {
	return new Database(objects);
}
