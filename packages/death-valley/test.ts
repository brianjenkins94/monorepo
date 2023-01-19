//import * as fs from "fs";
//import * as path from "path";

//import { ConstraintAction, Order, Type } from "./src/lib/base/enum";
//import { schema } from "./src/lib/schema/schema";
//import { MockDataGenerator } from "./src/testing/hr_schema/mock_data_generator";

import { Order, query } from "./deathValley";

/*
const schemaBuilder = schema.create("idk", 1);

schemaBuilder
	.createTable("Job")
	.addColumn("id", Type.STRING)
	.addColumn("title", Type.STRING)
	.addColumn("minSalary", Type.NUMBER)
	.addColumn("maxSalary", Type.NUMBER)
	.addPrimaryKey(["id"])
	.addIndex("idx_maxSalary", ["maxSalary"], false, Order.DESC);

schemaBuilder
	.createTable("JobHistory")
	.addColumn("employeeId", Type.STRING)
	.addColumn("startDate", Type.DATE_TIME)
	.addColumn("endDate", Type.DATE_TIME)
	.addColumn("jobId", Type.STRING)
	.addColumn("departmentId", Type.STRING)
	.addForeignKey("fk_EmployeeId", {
		"action": ConstraintAction.RESTRICT,
		"local": "employeeId",
		"ref": "Employee.id"
	})
	.addForeignKey("fk_DepartmentId", {
		"action": ConstraintAction.RESTRICT,
		"local": "departmentId",
		"ref": "Department.id"
	});

schemaBuilder
	.createTable("Employee")
	.addColumn("id", Type.STRING)
	.addColumn("firstName", Type.STRING)
	.addColumn("lastName", Type.STRING)
	.addColumn("email", Type.STRING)
	.addColumn("phoneNumber", Type.STRING)
	.addColumn("hireDate", Type.DATE_TIME)
	.addColumn("jobId", Type.STRING)
	.addColumn("salary", Type.NUMBER)
	.addColumn("commissionPercent", Type.NUMBER)
	.addColumn("managerId", Type.STRING)
	.addColumn("departmentId", Type.STRING)
	.addColumn("photo", Type.ARRAY_BUFFER)
	.addPrimaryKey(["id"])
	.addForeignKey("fk_JobId", {
		"action": ConstraintAction.RESTRICT,
		"local": "jobId",
		"ref": "Job.id"
	})
	.addForeignKey("fk_DepartmentId", {
		"action": ConstraintAction.RESTRICT,
		"local": "departmentId",
		"ref": "Department.id"
	})
	.addIndex("idx_salary", ["salary"], false, Order.DESC)
	.addNullable(["hireDate"]);

schemaBuilder
	.createTable("Department")
	.addColumn("id", Type.STRING)
	.addColumn("name", Type.STRING)
	.addColumn("managerId", Type.STRING)
	.addColumn("locationId", Type.STRING)
	.addPrimaryKey(["id"])
	.addForeignKey("fk_LocationId", {
		"action": ConstraintAction.RESTRICT,
		"local": "locationId",
		"ref": "Location.id"
	});

schemaBuilder
	.createTable("Location")
	.addColumn("id", Type.STRING)
	.addColumn("streetAddress", Type.STRING)
	.addColumn("postalCode", Type.STRING)
	.addColumn("city", Type.STRING)
	.addColumn("stateProvince", Type.STRING)
	.addColumn("countryId", Type.INTEGER)
	.addPrimaryKey(["id"])
	.addForeignKey("fk_CountryId", {
		"action": ConstraintAction.RESTRICT,
		"local": "countryId",
		"ref": "Country.id"
	});

schemaBuilder
	.createTable("Country")
	.addColumn("id", Type.INTEGER)
	.addColumn("name", Type.STRING)
	.addColumn("regionId", Type.STRING)
	.addPrimaryKey(["id"], true)
	.addForeignKey("fk_RegionId", {
		"action": ConstraintAction.RESTRICT,
		"local": "regionId",
		"ref": "Region.id"
	});

schemaBuilder
	.createTable("Region")
	.addColumn("id", Type.STRING)
	.addColumn("name", Type.STRING)
	.addPrimaryKey(["id"]);

schemaBuilder
	.createTable("Holiday")
	.addColumn("name", Type.STRING)
	.addColumn("begin", Type.DATE_TIME)
	.addColumn("end", Type.DATE_TIME)
	.addIndex("idx_begin", ["begin"], false, Order.ASC)
	.addPrimaryKey(["name"])
	.persistentIndex(true);

schemaBuilder
	.createTable("DummyTable")
	.addColumn("arraybuffer", Type.ARRAY_BUFFER)
	.addColumn("boolean", Type.BOOLEAN)
	.addColumn("datetime", Type.DATE_TIME)
	.addColumn("integer", Type.INTEGER)
	.addColumn("number", Type.NUMBER)
	.addColumn("string", Type.STRING)
	.addColumn("string2", Type.STRING)
	.addColumn("proto", Type.OBJECT)
	.addPrimaryKey(["string", "number"])
	.addUnique("uq_constraint", ["integer", "string2"])
	.addNullable(["datetime"]);

schemaBuilder
	.createTable("CrossColumnTable")
	.addColumn("integer1", Type.INTEGER)
	.addColumn("integer2", Type.INTEGER)
	.addColumn("string1", Type.STRING)
	.addColumn("string2", Type.STRING)
	.addNullable(["string1", "string2"])
	.addIndex("idx_ascDesc", [
		{
			"name": "integer1",
			"order": Order.ASC
		},
		{
			"name": "integer2",
			"order": Order.DESC
		}
	], true)
	.addIndex("idx_crossNull", ["string1", "string2"], true)
	.persistentIndex(true);

const db = await schemaBuilder.connect();

const dataGenerator = new MockDataGenerator();

dataGenerator.generate(50, 300, 10);

db
	.createTransaction()
	.exec([
		db.insert().into(db.getSchema().table("Region")).values(dataGenerator.sampleRegions),
		db.insert().into(db.getSchema().table("Country")).values(dataGenerator.sampleCountries),
		db.insert().into(db.getSchema().table("Location")).values(dataGenerator.sampleLocations),
		db.insert().into(db.getSchema().table("Department")).values(dataGenerator.sampleDepartments),
		db.insert().into(db.getSchema().table("Job")).values(dataGenerator.sampleJobs),
		db.insert().into(db.getSchema().table("Employee")).values(dataGenerator.sampleEmployees),
		db.insert().into(db.getSchema().table("CrossColumnTable")).values((() => {
			const sampleRows = new Array(20);
			const padZeros = (n: number) => (n < 10 ? `0${n}` : `${n}`);

			for (let i = 0; i < 20; i++) {
				sampleRows[i] = db.getSchema().table("CrossColumnTable").createRow({
					"integer1": i,
					"integer2": i * 10,
					// Generating a null value for i = [10, 12, 14].
					"string1":
						i % 2 === 0 && i >= 10 && i < 15 ? null : `string1_${padZeros(i)}`,
					// Generating a null value for i = 16 and 18.
					"string2": i % 2 === 0 && i >= 15 ? null : `string2_${i * 10}`
				});
			}
			return sampleRows;
		})())
	]);

const results = await db.select().from(db.getSchema().table("Job")).where(db.getSchema().table("Job").col("minSalary").gte(300000)).exec();

console.log(results);

fs.writeFileSync(path.join(__dirname, "output.json"), JSON.stringify(await db.export(), undefined, 4));

*/

/*
const schemaBuilder2 = schema.create("idk", 1);

schemaBuilder2
	.createTable("Job")
	.addColumn("id", Type.STRING)
	.addColumn("title", Type.STRING)
	.addColumn("minSalary", Type.NUMBER)
	.addColumn("maxSalary", Type.NUMBER);

schemaBuilder2
	.createTable("JobHistory")
	.addColumn("employeeId", Type.STRING)
	.addColumn("startDate", Type.DATE_TIME)
	.addColumn("endDate", Type.DATE_TIME)
	.addColumn("jobId", Type.STRING)
	.addColumn("departmentId", Type.STRING);

schemaBuilder2
	.createTable("Employee")
	.addColumn("id", Type.STRING)
	.addColumn("firstName", Type.STRING)
	.addColumn("lastName", Type.STRING)
	.addColumn("email", Type.STRING)
	.addColumn("phoneNumber", Type.STRING)
	.addColumn("hireDate", Type.DATE_TIME)
	.addColumn("jobId", Type.STRING)
	.addColumn("salary", Type.NUMBER)
	.addColumn("commissionPercent", Type.NUMBER)
	.addColumn("managerId", Type.STRING)
	.addColumn("departmentId", Type.STRING)
	.addColumn("photo", Type.ARRAY_BUFFER);

schemaBuilder2
	.createTable("Department")
	.addColumn("id", Type.STRING)
	.addColumn("name", Type.STRING)
	.addColumn("managerId", Type.STRING)
	.addColumn("locationId", Type.STRING);

schemaBuilder2
	.createTable("Location")
	.addColumn("id", Type.STRING)
	.addColumn("streetAddress", Type.STRING)
	.addColumn("postalCode", Type.STRING)
	.addColumn("city", Type.STRING)
	.addColumn("stateProvince", Type.STRING)
	.addColumn("countryId", Type.INTEGER);

schemaBuilder2
	.createTable("Country")
	.addColumn("id", Type.INTEGER)
	.addColumn("name", Type.STRING)
	.addColumn("regionId", Type.STRING);

schemaBuilder2
	.createTable("Region")
	.addColumn("id", Type.STRING)
	.addColumn("name", Type.STRING);

schemaBuilder2
	.createTable("Holiday")
	.addColumn("name", Type.STRING)
	.addColumn("begin", Type.DATE_TIME)
	.addColumn("end", Type.DATE_TIME);

schemaBuilder2
	.createTable("DummyTable")
	.addColumn("arraybuffer", Type.ARRAY_BUFFER)
	.addColumn("boolean", Type.BOOLEAN)
	.addColumn("datetime", Type.DATE_TIME)
	.addColumn("integer", Type.INTEGER)
	.addColumn("number", Type.NUMBER)
	.addColumn("string", Type.STRING)
	.addColumn("string2", Type.STRING)
	.addColumn("proto", Type.OBJECT);

schemaBuilder2
	.createTable("CrossColumnTable")
	.addColumn("integer1", Type.INTEGER)
	.addColumn("integer2", Type.INTEGER)
	.addColumn("string1", Type.STRING)
	.addColumn("string2", Type.STRING);

const db2 = await schemaBuilder2.connect(); // Make sure the database is empty.
*/

//const json = JSON.parse(fs.readFileSync(path.join(__dirname, "output.json"), { "encoding": "utf8" }))["tables"];

//await db2.import(json);

//const results = await db2.select().from(db2.getSchema().table("Job")).where(db2.getSchema().table("Job").col("minSalary").gte(300000)).exec();

const db = query({
	"Job": [
		{
			"id": "jobId0",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Accountant, Private"
		},
		{
			"id": "jobId1",
			"maxSalary": 300000,
			"minSalary": 100000,
			"title": "Loan Officer"
		},
		{
			"id": "jobId2",
			"maxSalary": 600000,
			"minSalary": 500000,
			"title": "Criminal Investigator and Special Agent"
		},
		{
			"id": "jobId3",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Computer and Information Systems Manager"
		},
		{
			"id": "jobId4",
			"maxSalary": 500000,
			"minSalary": 400000,
			"title": "Training Specialist"
		},
		{
			"id": "jobId5",
			"maxSalary": 500000,
			"minSalary": 400000,
			"title": "Nurse"
		},
		{
			"id": "jobId6",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Property, Real Estate, and Community Association Manager"
		},
		{
			"id": "jobId7",
			"maxSalary": 600000,
			"minSalary": 100000,
			"title": "Aircraft Mechanic"
		},
		{
			"id": "jobId8",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Registered Nurse"
		},
		{
			"id": "jobId9",
			"maxSalary": 500000,
			"minSalary": 200000,
			"title": "Recruiter"
		},
		{
			"id": "jobId10",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Economist"
		},
		{
			"id": "jobId11",
			"maxSalary": 600000,
			"minSalary": 500000,
			"title": "Purchasing manager, Buyer, and Purchasing agent"
		},
		{
			"id": "jobId12",
			"maxSalary": 600000,
			"minSalary": 500000,
			"title": "Systems Engineer"
		},
		{
			"id": "jobId13",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Quality Engineer"
		},
		{
			"id": "jobId14",
			"maxSalary": 600000,
			"minSalary": 400000,
			"title": "Electrical Engineer"
		},
		{
			"id": "jobId15",
			"maxSalary": 300000,
			"minSalary": 100000,
			"title": "Compensation or Benefits Manager"
		},
		{
			"id": "jobId16",
			"maxSalary": 100000,
			"minSalary": 100000,
			"title": "Accounting Specialist"
		},
		{
			"id": "jobId17",
			"maxSalary": 300000,
			"minSalary": 300000,
			"title": "Financial Analyst"
		},
		{
			"id": "jobId18",
			"maxSalary": 400000,
			"minSalary": 200000,
			"title": "Administrative Services Manager"
		},
		{
			"id": "jobId19",
			"maxSalary": 600000,
			"minSalary": 400000,
			"title": "Process Engineer"
		},
		{
			"id": "jobId20",
			"maxSalary": 600000,
			"minSalary": 100000,
			"title": "Design Engineer"
		},
		{
			"id": "jobId21",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Credit Analyst"
		},
		{
			"id": "jobId22",
			"maxSalary": 600000,
			"minSalary": 300000,
			"title": "Loss Prevention Specialist"
		},
		{
			"id": "jobId23",
			"maxSalary": 600000,
			"minSalary": 100000,
			"title": "Human Resources Generalist"
		},
		{
			"id": "jobId24",
			"maxSalary": 600000,
			"minSalary": 100000,
			"title": "Payroll Clerk"
		},
		{
			"id": "jobId25",
			"maxSalary": 400000,
			"minSalary": 200000,
			"title": "Budget Analyst"
		},
		{
			"id": "jobId26",
			"maxSalary": 500000,
			"minSalary": 200000,
			"title": "Labor Relations Specialist"
		},
		{
			"id": "jobId27",
			"maxSalary": 600000,
			"minSalary": 400000,
			"title": "Food Service Manager"
		},
		{
			"id": "jobId28",
			"maxSalary": 300000,
			"minSalary": 100000,
			"title": "Software Engineer"
		},
		{
			"id": "jobId29",
			"maxSalary": 500000,
			"minSalary": 200000,
			"title": "Arbitrators, Mediators, and Conciliators"
		},
		{
			"id": "jobId30",
			"maxSalary": 300000,
			"minSalary": 100000,
			"title": "Mechanical Engineer"
		},
		{
			"id": "jobId31",
			"maxSalary": 500000,
			"minSalary": 200000,
			"title": "Employment Manager"
		},
		{
			"id": "jobId32",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Appraiser and Assessor of Real Estate"
		},
		{
			"id": "jobId33",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Speech Language Pathologist"
		},
		{
			"id": "jobId34",
			"maxSalary": 500000,
			"minSalary": 200000,
			"title": "Advertising Sales Agent"
		},
		{
			"id": "jobId35",
			"maxSalary": 600000,
			"minSalary": 300000,
			"title": "Project Engineer"
		},
		{
			"id": "jobId36",
			"maxSalary": 600000,
			"minSalary": 500000,
			"title": "Auditor"
		},
		{
			"id": "jobId37",
			"maxSalary": 400000,
			"minSalary": 200000,
			"title": "Energy Broker"
		},
		{
			"id": "jobId38",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Business Continuity Planner"
		},
		{
			"id": "jobId39",
			"maxSalary": 600000,
			"minSalary": 300000,
			"title": "Java Developer"
		},
		{
			"id": "jobId40",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Fraud Examiner"
		},
		{
			"id": "jobId41",
			"maxSalary": 600000,
			"minSalary": 300000,
			"title": "Personnel Recruiter"
		},
		{
			"id": "jobId42",
			"maxSalary": 300000,
			"minSalary": 100000,
			"title": "Community Service Manager"
		},
		{
			"id": "jobId43",
			"maxSalary": 600000,
			"minSalary": 500000,
			"title": "Project Manager"
		},
		{
			"id": "jobId44",
			"maxSalary": 500000,
			"minSalary": 200000,
			"title": "Human Resources Specialist"
		},
		{
			"id": "jobId45",
			"maxSalary": 600000,
			"minSalary": 100000,
			"title": "Pharmacist"
		},
		{
			"id": "jobId46",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Antenna Engineer"
		},
		{
			"id": "jobId47",
			"maxSalary": 500000,
			"minSalary": 300000,
			"title": "Grant writer"
		},
		{
			"id": "jobId48",
			"maxSalary": 400000,
			"minSalary": 100000,
			"title": "Event Planner"
		},
		{
			"id": "jobId49",
			"maxSalary": 200000,
			"minSalary": 200000,
			"title": "Antenna Operator"
		}
	],
	"JobHistory": [],
	"Employee": [
		{
			"id": "employeeId0",
			"firstName": "Austin",
			"lastName": "Flores",
			"email": "austin.flores@theweb.com",
			"phoneNumber": "1634017081",
			"hireDate": "2002-02-20T17:31:30.075Z",
			"jobId": "jobId0",
			"salary": 208095,
			"commissionPercent": 0.737231690942496,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId1",
			"firstName": "Sophie",
			"lastName": "Jenkins",
			"email": "sophie.jenkins@theweb.com",
			"phoneNumber": "1297306275",
			"hireDate": "1999-02-17T05:37:09.626Z",
			"jobId": "jobId1",
			"salary": 169451,
			"commissionPercent": 0.6118511599291404,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId2",
			"firstName": "Sarah",
			"lastName": "Simmons",
			"email": "sarah.simmons@theweb.com",
			"phoneNumber": "1188775063",
			"hireDate": "2010-11-27T00:21:30.399Z",
			"jobId": "jobId2",
			"salary": 199632,
			"commissionPercent": 1.1387945769961558,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId3",
			"firstName": "Mackenzie",
			"lastName": "Rogers",
			"email": "mackenzie.rogers@theweb.com",
			"phoneNumber": "1873137672",
			"hireDate": "2004-06-21T13:10:17.015Z",
			"jobId": "jobId3",
			"salary": 63207,
			"commissionPercent": 0.2270474742511178,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId4",
			"firstName": "Cooper",
			"lastName": "Hughes",
			"email": "cooper.hughes@theweb.com",
			"phoneNumber": "1450966277",
			"hireDate": "1984-05-06T05:48:06.961Z",
			"jobId": "jobId4",
			"salary": 22910,
			"commissionPercent": 1.03868283872026,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId5",
			"firstName": "Isla",
			"lastName": "Roberts",
			"email": "isla.roberts@theweb.com",
			"phoneNumber": "1842924724",
			"hireDate": "2009-05-21T18:32:17.905Z",
			"jobId": "jobId5",
			"salary": 128239,
			"commissionPercent": 0.3528214153110679,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId6",
			"firstName": "Colton",
			"lastName": "Jenkins",
			"email": "colton.jenkins@theweb.com",
			"phoneNumber": "1310184287",
			"hireDate": "1989-01-01T10:45:10.686Z",
			"jobId": "jobId6",
			"salary": 65281,
			"commissionPercent": 0.5857178580401733,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId7",
			"firstName": "Clara",
			"lastName": "Jackson",
			"email": "clara.jackson@theweb.com",
			"phoneNumber": "1577075328",
			"hireDate": "1982-03-28T00:51:02.040Z",
			"jobId": "jobId7",
			"salary": 202468,
			"commissionPercent": 0.37671851640142184,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId8",
			"firstName": "Leah",
			"lastName": "Perez",
			"email": "leah.perez@theweb.com",
			"phoneNumber": "1369012995",
			"hireDate": "1993-05-05T13:35:30.123Z",
			"jobId": "jobId8",
			"salary": 81435,
			"commissionPercent": 0.9589138509392442,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId9",
			"firstName": "Natalie",
			"lastName": "Rogers",
			"email": "natalie.rogers@theweb.com",
			"phoneNumber": "1384061621",
			"hireDate": "1980-12-02T14:42:14.412Z",
			"jobId": "jobId9",
			"salary": 105815,
			"commissionPercent": 0.9130579935619779,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId10",
			"firstName": "Gianna",
			"lastName": "Powell",
			"email": "gianna.powell@theweb.com",
			"phoneNumber": "1727892575",
			"hireDate": "2003-09-04T02:33:11.781Z",
			"jobId": "jobId10",
			"salary": 40806,
			"commissionPercent": 0.1625607360992721,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId11",
			"firstName": "Isabella",
			"lastName": "Davis,",
			"email": "isabella.davis,@theweb.com",
			"phoneNumber": "1616113998",
			"hireDate": "2001-08-29T21:05:01.162Z",
			"jobId": "jobId11",
			"salary": 180121,
			"commissionPercent": 0.6500735722438856,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId12",
			"firstName": "Gavin",
			"lastName": "Simmons",
			"email": "gavin.simmons@theweb.com",
			"phoneNumber": "1885573665",
			"hireDate": "2000-06-10T09:58:00.138Z",
			"jobId": "jobId12",
			"salary": 179764,
			"commissionPercent": 0.7732809643257889,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId13",
			"firstName": "Alice",
			"lastName": "Barnes",
			"email": "alice.barnes@theweb.com",
			"phoneNumber": "1571790641",
			"hireDate": "2009-10-13T00:04:52.265Z",
			"jobId": "jobId13",
			"salary": 44873,
			"commissionPercent": 0.7073056992314221,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId14",
			"firstName": "Nolan",
			"lastName": "Butler",
			"email": "nolan.butler@theweb.com",
			"phoneNumber": "1253336020",
			"hireDate": "1997-02-09T12:52:08.086Z",
			"jobId": "jobId14",
			"salary": 67681,
			"commissionPercent": 0.6703754730625012,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId15",
			"firstName": "Kate",
			"lastName": "Gonzalez",
			"email": "kate.gonzalez@theweb.com",
			"phoneNumber": "1601713330",
			"hireDate": "2006-03-14T07:16:20.920Z",
			"jobId": "jobId15",
			"salary": 118993,
			"commissionPercent": 0.41761181002612335,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId16",
			"firstName": "Jack",
			"lastName": "Robinson",
			"email": "jack.robinson@theweb.com",
			"phoneNumber": "1215126748",
			"hireDate": "1982-05-04T19:54:29.781Z",
			"jobId": "jobId16",
			"salary": 88735,
			"commissionPercent": 0.4446606589757639,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId17",
			"firstName": "Jackson",
			"lastName": "Hughes",
			"email": "jackson.hughes@theweb.com",
			"phoneNumber": "1061117756",
			"hireDate": "1982-02-15T17:26:18.600Z",
			"jobId": "jobId17",
			"salary": 135971,
			"commissionPercent": 0.5984112361321398,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId18",
			"firstName": "Noah",
			"lastName": "Kelly",
			"email": "noah.kelly@theweb.com",
			"phoneNumber": "1425302602",
			"hireDate": "2011-05-24T08:40:12.005Z",
			"jobId": "jobId18",
			"salary": 197549,
			"commissionPercent": 1.0571752962569414,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId19",
			"firstName": "Ryan",
			"lastName": "Torres",
			"email": "ryan.torres@theweb.com",
			"phoneNumber": "1632530405",
			"hireDate": "2001-10-31T00:10:13.763Z",
			"jobId": "jobId19",
			"salary": 62891,
			"commissionPercent": 0.9190630575697888,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId20",
			"firstName": "Ethan",
			"lastName": "Griffin",
			"email": "ethan.griffin@theweb.com",
			"phoneNumber": "1523777786",
			"hireDate": "2012-02-05T19:44:31.084Z",
			"jobId": "jobId20",
			"salary": 130370,
			"commissionPercent": 1.0782634529969104,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId21",
			"firstName": "Dominic",
			"lastName": "Allen",
			"email": "dominic.allen@theweb.com",
			"phoneNumber": "1664012536",
			"hireDate": "1991-12-04T06:10:42.363Z",
			"jobId": "jobId21",
			"salary": 119089,
			"commissionPercent": 0.8962616057986009,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId22",
			"firstName": "Caroline",
			"lastName": "Lewis",
			"email": "caroline.lewis@theweb.com",
			"phoneNumber": "1719381682",
			"hireDate": "1990-05-17T11:18:58.932Z",
			"jobId": "jobId22",
			"salary": 56118,
			"commissionPercent": 0.6929921517281988,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId23",
			"firstName": "Arianna",
			"lastName": "Carter",
			"email": "arianna.carter@theweb.com",
			"phoneNumber": "1290023380",
			"hireDate": "2006-05-27T23:14:10.623Z",
			"jobId": "jobId23",
			"salary": 57453,
			"commissionPercent": 0.26585014413599317,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId24",
			"firstName": "Hannah",
			"lastName": "Howard",
			"email": "hannah.howard@theweb.com",
			"phoneNumber": "1482772761",
			"hireDate": "1997-09-20T21:21:09.207Z",
			"jobId": "jobId24",
			"salary": 66312,
			"commissionPercent": 0.9744019509811127,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId25",
			"firstName": "Madelyn",
			"lastName": "Perry",
			"email": "madelyn.perry@theweb.com",
			"phoneNumber": "1158362418",
			"hireDate": "2000-09-01T17:01:36.666Z",
			"jobId": "jobId25",
			"salary": 41085,
			"commissionPercent": 0.8255857627586939,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId26",
			"firstName": "Ryder",
			"lastName": "Robinson",
			"email": "ryder.robinson@theweb.com",
			"phoneNumber": "1556752778",
			"hireDate": "1991-08-15T20:14:12.422Z",
			"jobId": "jobId26",
			"salary": 165038,
			"commissionPercent": 0.537628355383556,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId27",
			"firstName": "Emma",
			"lastName": "Flores",
			"email": "emma.flores@theweb.com",
			"phoneNumber": "1428604893",
			"hireDate": "2011-07-27T20:22:03.197Z",
			"jobId": "jobId27",
			"salary": 37938,
			"commissionPercent": 0.6389558930790734,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId28",
			"firstName": "Logan",
			"lastName": "Torres",
			"email": "logan.torres@theweb.com",
			"phoneNumber": "1427016752",
			"hireDate": "2010-02-15T03:55:40.945Z",
			"jobId": "jobId28",
			"salary": 201590,
			"commissionPercent": 0.8801625264191321,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId29",
			"firstName": "Addison",
			"lastName": "Alexander",
			"email": "addison.alexander@theweb.com",
			"phoneNumber": "1947175733",
			"hireDate": "1989-06-14T15:59:49.216Z",
			"jobId": "jobId29",
			"salary": 120947,
			"commissionPercent": 0.8216518835808718,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId30",
			"firstName": "Lincoln",
			"lastName": "King",
			"email": "lincoln.king@theweb.com",
			"phoneNumber": "1414064731",
			"hireDate": "1980-12-14T07:13:33.107Z",
			"jobId": "jobId30",
			"salary": 158385,
			"commissionPercent": 0.2582727964529289,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId31",
			"firstName": "Mila",
			"lastName": "Rodriguez",
			"email": "mila.rodriguez@theweb.com",
			"phoneNumber": "1458236816",
			"hireDate": "1984-08-14T15:39:27.162Z",
			"jobId": "jobId31",
			"salary": 23238,
			"commissionPercent": 1.1057777959512125,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId32",
			"firstName": "Jeremiah",
			"lastName": "King",
			"email": "jeremiah.king@theweb.com",
			"phoneNumber": "1064955577",
			"hireDate": "1984-01-09T19:58:22.093Z",
			"jobId": "jobId32",
			"salary": 24448,
			"commissionPercent": 0.9096178851465276,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId33",
			"firstName": "Brody",
			"lastName": "Hill",
			"email": "brody.hill@theweb.com",
			"phoneNumber": "1726826781",
			"hireDate": "1999-11-07T16:54:01.898Z",
			"jobId": "jobId33",
			"salary": 90114,
			"commissionPercent": 0.2122055328730191,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId34",
			"firstName": "Eliana",
			"lastName": "Hill",
			"email": "eliana.hill@theweb.com",
			"phoneNumber": "1561313714",
			"hireDate": "1980-04-02T19:07:48.643Z",
			"jobId": "jobId34",
			"salary": 46886,
			"commissionPercent": 0.5256341397432839,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId35",
			"firstName": "Landon",
			"lastName": "Flores",
			"email": "landon.flores@theweb.com",
			"phoneNumber": "1594853194",
			"hireDate": "1996-07-30T18:33:52.652Z",
			"jobId": "jobId35",
			"salary": 92997,
			"commissionPercent": 1.1052742453253612,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId36",
			"firstName": "Asher",
			"lastName": "Martin",
			"email": "asher.martin@theweb.com",
			"phoneNumber": "1274852021",
			"hireDate": "1982-10-31T16:42:57.149Z",
			"jobId": "jobId36",
			"salary": 82303,
			"commissionPercent": 0.5467619708308512,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId37",
			"firstName": "Alyssa",
			"lastName": "Brooks",
			"email": "alyssa.brooks@theweb.com",
			"phoneNumber": "1548636380",
			"hireDate": "1990-11-18T11:16:23.833Z",
			"jobId": "jobId37",
			"salary": 169649,
			"commissionPercent": 0.2622400200681224,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId38",
			"firstName": "Eva",
			"lastName": "Young",
			"email": "eva.young@theweb.com",
			"phoneNumber": "1560913451",
			"hireDate": "1995-01-09T21:54:31.785Z",
			"jobId": "jobId38",
			"salary": 193368,
			"commissionPercent": 1.0468090510181314,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId39",
			"firstName": "Parker",
			"lastName": "Clark",
			"email": "parker.clark@theweb.com",
			"phoneNumber": "1725541507",
			"hireDate": "1989-03-21T09:38:43.441Z",
			"jobId": "jobId39",
			"salary": 131149,
			"commissionPercent": 0.5353940948233619,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId40",
			"firstName": "Maria",
			"lastName": "Morris",
			"email": "maria.morris@theweb.com",
			"phoneNumber": "1824571959",
			"hireDate": "2002-01-19T16:53:53.067Z",
			"jobId": "jobId40",
			"salary": 156061,
			"commissionPercent": 0.7779768824735708,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId41",
			"firstName": "Isabelle",
			"lastName": "Adams",
			"email": "isabelle.adams@theweb.com",
			"phoneNumber": "1163626231",
			"hireDate": "2007-04-05T17:26:07.987Z",
			"jobId": "jobId41",
			"salary": 125569,
			"commissionPercent": 0.24045544255252657,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId42",
			"firstName": "Thomas",
			"lastName": "James",
			"email": "thomas.james@theweb.com",
			"phoneNumber": "1082225626",
			"hireDate": "2007-07-06T01:43:23.397Z",
			"jobId": "jobId42",
			"salary": 107371,
			"commissionPercent": 0.895026561774738,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId43",
			"firstName": "Brianna",
			"lastName": "Harris",
			"email": "brianna.harris@theweb.com",
			"phoneNumber": "1011506017",
			"hireDate": "2006-05-15T07:46:57.627Z",
			"jobId": "jobId43",
			"salary": 21221,
			"commissionPercent": 0.714536904382466,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId44",
			"firstName": "Jasmine",
			"lastName": "Lopez",
			"email": "jasmine.lopez@theweb.com",
			"phoneNumber": "1578774282",
			"hireDate": "2001-12-14T23:01:48.808Z",
			"jobId": "jobId44",
			"salary": 52847,
			"commissionPercent": 1.100934516128679,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId45",
			"firstName": "Caleb",
			"lastName": "Hill",
			"email": "caleb.hill@theweb.com",
			"phoneNumber": "1680461047",
			"hireDate": "2011-06-16T05:42:06.959Z",
			"jobId": "jobId45",
			"salary": 12138,
			"commissionPercent": 1.0945128730788312,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId46",
			"firstName": "Dominic",
			"lastName": "Brown,",
			"email": "dominic.brown,@theweb.com",
			"phoneNumber": "1058180254",
			"hireDate": "2007-09-28T23:38:37.270Z",
			"jobId": "jobId46",
			"salary": 135832,
			"commissionPercent": 0.730239236719073,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId47",
			"firstName": "Joshua",
			"lastName": "Mitchell",
			"email": "joshua.mitchell@theweb.com",
			"phoneNumber": "1837779959",
			"hireDate": "2004-03-17T07:56:23.556Z",
			"jobId": "jobId47",
			"salary": 90812,
			"commissionPercent": 0.999466503257363,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId48",
			"firstName": "Carter",
			"lastName": "Turner",
			"email": "carter.turner@theweb.com",
			"phoneNumber": "1617825185",
			"hireDate": "1998-09-26T20:11:00.807Z",
			"jobId": "jobId48",
			"salary": 93293,
			"commissionPercent": 0.8320045512866688,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId49",
			"firstName": "Taylor",
			"lastName": "Lewis",
			"email": "taylor.lewis@theweb.com",
			"phoneNumber": "1520235900",
			"hireDate": "2012-02-09T15:43:50.805Z",
			"jobId": "jobId49",
			"salary": 101913,
			"commissionPercent": 1.1349077484846335,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId50",
			"firstName": "Leah",
			"lastName": "Thompson",
			"email": "leah.thompson@theweb.com",
			"phoneNumber": "1647425519",
			"hireDate": "1987-09-01T23:32:11.310Z",
			"jobId": "jobId41",
			"salary": 118233,
			"commissionPercent": 0.9252735035085494,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId51",
			"firstName": "Eli",
			"lastName": "Butler",
			"email": "eli.butler@theweb.com",
			"phoneNumber": "1922652441",
			"hireDate": "1991-06-08T23:22:54.895Z",
			"jobId": "jobId33",
			"salary": 162171,
			"commissionPercent": 0.5580634843451725,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId52",
			"firstName": "Eliana",
			"lastName": "Campbell",
			"email": "eliana.campbell@theweb.com",
			"phoneNumber": "1971802299",
			"hireDate": "1994-11-28T13:41:34.307Z",
			"jobId": "jobId11",
			"salary": 114232,
			"commissionPercent": 0.3340041830732835,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId53",
			"firstName": "Chloe",
			"lastName": "Hayes",
			"email": "chloe.hayes@theweb.com",
			"phoneNumber": "1599984763",
			"hireDate": "1995-11-26T13:19:10.584Z",
			"jobId": "jobId6",
			"salary": 153532,
			"commissionPercent": 0.3483036932986091,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId54",
			"firstName": "Samuel",
			"lastName": "Mitchell",
			"email": "samuel.mitchell@theweb.com",
			"phoneNumber": "1999638266",
			"hireDate": "2007-01-05T11:24:03.081Z",
			"jobId": "jobId30",
			"salary": 87168,
			"commissionPercent": 0.7920732543517156,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId55",
			"firstName": "Alice",
			"lastName": "Green",
			"email": "alice.green@theweb.com",
			"phoneNumber": "1106583746",
			"hireDate": "2013-07-25T15:01:44.843Z",
			"jobId": "jobId4",
			"salary": 191546,
			"commissionPercent": 1.1092601948466205,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId56",
			"firstName": "Hudson",
			"lastName": "White",
			"email": "hudson.white@theweb.com",
			"phoneNumber": "1757667094",
			"hireDate": "1996-12-21T02:59:08.334Z",
			"jobId": "jobId39",
			"salary": 102693,
			"commissionPercent": 0.8165628665746792,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId57",
			"firstName": "Sydney",
			"lastName": "Bell",
			"email": "sydney.bell@theweb.com",
			"phoneNumber": "1663376484",
			"hireDate": "1985-05-23T21:14:33.561Z",
			"jobId": "jobId43",
			"salary": 40061,
			"commissionPercent": 1.0975034823118086,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId58",
			"firstName": "Evelyn",
			"lastName": "Hall",
			"email": "evelyn.hall@theweb.com",
			"phoneNumber": "1296299634",
			"hireDate": "1999-07-17T07:59:40.917Z",
			"jobId": "jobId0",
			"salary": 105361,
			"commissionPercent": 0.8672307564866887,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId59",
			"firstName": "Brooke",
			"lastName": "Allen",
			"email": "brooke.allen@theweb.com",
			"phoneNumber": "1164629354",
			"hireDate": "1990-04-13T08:07:18.003Z",
			"jobId": "jobId14",
			"salary": 24268,
			"commissionPercent": 0.5936206065931834,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId60",
			"firstName": "Layla",
			"lastName": "Hayes",
			"email": "layla.hayes@theweb.com",
			"phoneNumber": "1155969487",
			"hireDate": "2012-08-03T00:34:54.169Z",
			"jobId": "jobId28",
			"salary": 145893,
			"commissionPercent": 0.38423960808810886,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId61",
			"firstName": "Kylie",
			"lastName": "Rivera",
			"email": "kylie.rivera@theweb.com",
			"phoneNumber": "1958097913",
			"hireDate": "1988-12-18T17:42:29.315Z",
			"jobId": "jobId38",
			"salary": 192651,
			"commissionPercent": 1.1223651072906107,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId62",
			"firstName": "Brooklyn",
			"lastName": "Phillips",
			"email": "brooklyn.phillips@theweb.com",
			"phoneNumber": "1916516475",
			"hireDate": "1991-10-07T13:25:16.391Z",
			"jobId": "jobId2",
			"salary": 92146,
			"commissionPercent": 0.33554346957029335,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId63",
			"firstName": "Alexa",
			"lastName": "Martin",
			"email": "alexa.martin@theweb.com",
			"phoneNumber": "1415765272",
			"hireDate": "1988-08-31T03:50:45.671Z",
			"jobId": "jobId20",
			"salary": 41284,
			"commissionPercent": 1.109386480139874,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId64",
			"firstName": "Christian",
			"lastName": "Robinson",
			"email": "christian.robinson@theweb.com",
			"phoneNumber": "1586202035",
			"hireDate": "1984-03-01T18:02:29.539Z",
			"jobId": "jobId4",
			"salary": 159737,
			"commissionPercent": 1.1366606985044514,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId65",
			"firstName": "Xavier",
			"lastName": "Evans",
			"email": "xavier.evans@theweb.com",
			"phoneNumber": "1110136254",
			"hireDate": "2001-01-30T20:11:23.767Z",
			"jobId": "jobId31",
			"salary": 20925,
			"commissionPercent": 1.0903573069665022,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId66",
			"firstName": "Riley",
			"lastName": "Baker",
			"email": "riley.baker@theweb.com",
			"phoneNumber": "1293103884",
			"hireDate": "2002-05-10T06:41:15.805Z",
			"jobId": "jobId32",
			"salary": 21954,
			"commissionPercent": 0.7310719512307228,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId67",
			"firstName": "Brianna",
			"lastName": "Williams",
			"email": "brianna.williams@theweb.com",
			"phoneNumber": "1090376831",
			"hireDate": "2014-08-07T15:37:58.412Z",
			"jobId": "jobId0",
			"salary": 128966,
			"commissionPercent": 0.8332759737104262,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId68",
			"firstName": "Asher",
			"lastName": "Baker",
			"email": "asher.baker@theweb.com",
			"phoneNumber": "1901329511",
			"hireDate": "1997-05-19T08:34:55.128Z",
			"jobId": "jobId33",
			"salary": 49974,
			"commissionPercent": 0.9745237135520176,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId69",
			"firstName": "Ryder",
			"lastName": "James",
			"email": "ryder.james@theweb.com",
			"phoneNumber": "1380338778",
			"hireDate": "1999-06-15T22:40:48.681Z",
			"jobId": "jobId7",
			"salary": 46815,
			"commissionPercent": 0.2485870457330138,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId70",
			"firstName": "Alyssa",
			"lastName": "Clark",
			"email": "alyssa.clark@theweb.com",
			"phoneNumber": "1739978734",
			"hireDate": "2009-02-01T11:50:56.810Z",
			"jobId": "jobId23",
			"salary": 52921,
			"commissionPercent": 0.3695602219950188,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId71",
			"firstName": "Brooke",
			"lastName": "Rodriguez",
			"email": "brooke.rodriguez@theweb.com",
			"phoneNumber": "1588203000",
			"hireDate": "1985-01-01T12:19:15.986Z",
			"jobId": "jobId13",
			"salary": 73999,
			"commissionPercent": 0.3986286656786461,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId72",
			"firstName": "Alexandra",
			"lastName": "Hayes",
			"email": "alexandra.hayes@theweb.com",
			"phoneNumber": "1379275705",
			"hireDate": "1995-06-30T07:02:09.128Z",
			"jobId": "jobId0",
			"salary": 110997,
			"commissionPercent": 0.5024798602894757,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId73",
			"firstName": "Eliana",
			"lastName": "Lopez",
			"email": "eliana.lopez@theweb.com",
			"phoneNumber": "1145075910",
			"hireDate": "1989-08-11T03:17:52.434Z",
			"jobId": "jobId49",
			"salary": 60337,
			"commissionPercent": 0.32990082945209565,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId74",
			"firstName": "Declan",
			"lastName": "Morris",
			"email": "declan.morris@theweb.com",
			"phoneNumber": "1301310727",
			"hireDate": "1988-07-19T03:15:11.273Z",
			"jobId": "jobId49",
			"salary": 206144,
			"commissionPercent": 1.0570304864198445,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId75",
			"firstName": "Kennedy",
			"lastName": "Williams",
			"email": "kennedy.williams@theweb.com",
			"phoneNumber": "1821892706",
			"hireDate": "2004-09-11T13:16:24.306Z",
			"jobId": "jobId2",
			"salary": 190669,
			"commissionPercent": 0.8431461801189498,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId76",
			"firstName": "Stella",
			"lastName": "Peterson",
			"email": "stella.peterson@theweb.com",
			"phoneNumber": "1801796259",
			"hireDate": "1991-02-18T02:47:53.395Z",
			"jobId": "jobId8",
			"salary": 193828,
			"commissionPercent": 0.5093487969006557,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId77",
			"firstName": "Elijah",
			"lastName": "Wood",
			"email": "elijah.wood@theweb.com",
			"phoneNumber": "1885164177",
			"hireDate": "1988-04-18T21:38:11.539Z",
			"jobId": "jobId34",
			"salary": 203988,
			"commissionPercent": 0.16862908867165757,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId78",
			"firstName": "Layla",
			"lastName": "Campbell",
			"email": "layla.campbell@theweb.com",
			"phoneNumber": "1890013976",
			"hireDate": "2012-10-17T15:14:13.024Z",
			"jobId": "jobId36",
			"salary": 43148,
			"commissionPercent": 0.29422379701709256,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId79",
			"firstName": "Nathaniel",
			"lastName": "Price",
			"email": "nathaniel.price@theweb.com",
			"phoneNumber": "1044784842",
			"hireDate": "2007-04-28T18:01:19.372Z",
			"jobId": "jobId5",
			"salary": 139228,
			"commissionPercent": 0.7962099692437025,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId80",
			"firstName": "Elise",
			"lastName": "Hughes",
			"email": "elise.hughes@theweb.com",
			"phoneNumber": "1274206335",
			"hireDate": "1981-05-06T21:47:02.664Z",
			"jobId": "jobId30",
			"salary": 158537,
			"commissionPercent": 1.1101332971640583,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId81",
			"firstName": "Anna",
			"lastName": "Simmons",
			"email": "anna.simmons@theweb.com",
			"phoneNumber": "1438815916",
			"hireDate": "2010-12-07T15:36:44.251Z",
			"jobId": "jobId16",
			"salary": 13279,
			"commissionPercent": 0.680701654039365,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId82",
			"firstName": "Cooper",
			"lastName": "Butler",
			"email": "cooper.butler@theweb.com",
			"phoneNumber": "1976491517",
			"hireDate": "1995-01-25T04:02:33.301Z",
			"jobId": "jobId7",
			"salary": 184226,
			"commissionPercent": 0.7315145137856033,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId83",
			"firstName": "Evan",
			"lastName": "Perez",
			"email": "evan.perez@theweb.com",
			"phoneNumber": "1409357031",
			"hireDate": "1980-07-04T02:34:08.848Z",
			"jobId": "jobId28",
			"salary": 24856,
			"commissionPercent": 0.841169080613679,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId84",
			"firstName": "Jackson",
			"lastName": "Russell",
			"email": "jackson.russell@theweb.com",
			"phoneNumber": "1122558395",
			"hireDate": "2005-04-18T08:13:22.666Z",
			"jobId": "jobId20",
			"salary": 120492,
			"commissionPercent": 1.0693753286689174,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId85",
			"firstName": "Grace",
			"lastName": "Davis,",
			"email": "grace.davis,@theweb.com",
			"phoneNumber": "1938466504",
			"hireDate": "2014-06-16T01:57:11.628Z",
			"jobId": "jobId20",
			"salary": 71728,
			"commissionPercent": 0.2550448206303465,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId86",
			"firstName": "Oliver",
			"lastName": "Wilson",
			"email": "oliver.wilson@theweb.com",
			"phoneNumber": "1089683911",
			"hireDate": "2012-07-01T05:51:09.005Z",
			"jobId": "jobId8",
			"salary": 42214,
			"commissionPercent": 0.2537771675074475,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId87",
			"firstName": "Jason",
			"lastName": "Bryant",
			"email": "jason.bryant@theweb.com",
			"phoneNumber": "1095993222",
			"hireDate": "1988-05-27T13:45:08.940Z",
			"jobId": "jobId9",
			"salary": 84340,
			"commissionPercent": 0.8014679954472012,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId88",
			"firstName": "Victoria",
			"lastName": "Phillips",
			"email": "victoria.phillips@theweb.com",
			"phoneNumber": "1589665864",
			"hireDate": "1983-08-15T18:33:47.812Z",
			"jobId": "jobId31",
			"salary": 82377,
			"commissionPercent": 0.19948892492375445,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId89",
			"firstName": "Sebastian",
			"lastName": "Martin",
			"email": "sebastian.martin@theweb.com",
			"phoneNumber": "1064455567",
			"hireDate": "2004-07-28T11:45:20.184Z",
			"jobId": "jobId48",
			"salary": 73450,
			"commissionPercent": 0.3022633661969646,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId90",
			"firstName": "Micah",
			"lastName": "Murphy",
			"email": "micah.murphy@theweb.com",
			"phoneNumber": "1986173490",
			"hireDate": "1982-04-15T03:32:10.248Z",
			"jobId": "jobId30",
			"salary": 79697,
			"commissionPercent": 0.6983319646663718,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId91",
			"firstName": "David",
			"lastName": "Bell",
			"email": "david.bell@theweb.com",
			"phoneNumber": "1077258145",
			"hireDate": "2014-05-25T07:34:06.973Z",
			"jobId": "jobId26",
			"salary": 183010,
			"commissionPercent": 0.40563588829584607,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId92",
			"firstName": "Taylor",
			"lastName": "Miller,",
			"email": "taylor.miller,@theweb.com",
			"phoneNumber": "1179329314",
			"hireDate": "1987-05-04T15:40:34.426Z",
			"jobId": "jobId14",
			"salary": 48801,
			"commissionPercent": 0.2448006780197541,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId93",
			"firstName": "Colton",
			"lastName": "Perry",
			"email": "colton.perry@theweb.com",
			"phoneNumber": "1708137671",
			"hireDate": "2001-10-25T05:35:01.109Z",
			"jobId": "jobId1",
			"salary": 67378,
			"commissionPercent": 0.7664620580848708,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId94",
			"firstName": "Chloe",
			"lastName": "Phillips",
			"email": "chloe.phillips@theweb.com",
			"phoneNumber": "1801274697",
			"hireDate": "2005-12-20T21:23:19.157Z",
			"jobId": "jobId4",
			"salary": 37174,
			"commissionPercent": 0.6406691431550048,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId95",
			"firstName": "Joshua",
			"lastName": "Harris",
			"email": "joshua.harris@theweb.com",
			"phoneNumber": "1716302215",
			"hireDate": "1989-11-14T05:23:54.364Z",
			"jobId": "jobId13",
			"salary": 65638,
			"commissionPercent": 0.32078492270276404,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId96",
			"firstName": "Micah",
			"lastName": "Griffin",
			"email": "micah.griffin@theweb.com",
			"phoneNumber": "1308117464",
			"hireDate": "2001-05-10T08:20:04.642Z",
			"jobId": "jobId3",
			"salary": 104904,
			"commissionPercent": 0.6009532972422037,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId97",
			"firstName": "Reese",
			"lastName": "Cooper",
			"email": "reese.cooper@theweb.com",
			"phoneNumber": "1430429878",
			"hireDate": "2001-04-13T08:17:07.591Z",
			"jobId": "jobId3",
			"salary": 193965,
			"commissionPercent": 0.7436535353179704,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId98",
			"firstName": "Declan",
			"lastName": "Price",
			"email": "declan.price@theweb.com",
			"phoneNumber": "1996299863",
			"hireDate": "1980-12-27T11:10:46.896Z",
			"jobId": "jobId42",
			"salary": 163262,
			"commissionPercent": 0.6677176947623827,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId99",
			"firstName": "Aria",
			"lastName": "Hill",
			"email": "aria.hill@theweb.com",
			"phoneNumber": "1453261262",
			"hireDate": "1993-02-09T06:18:31.399Z",
			"jobId": "jobId15",
			"salary": 121654,
			"commissionPercent": 0.9674978228811756,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId100",
			"firstName": "Chloe",
			"lastName": "Rogers",
			"email": "chloe.rogers@theweb.com",
			"phoneNumber": "1370000317",
			"hireDate": "2004-08-07T10:03:29.972Z",
			"jobId": "jobId33",
			"salary": 114112,
			"commissionPercent": 0.1571074499331205,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId101",
			"firstName": "Xavier",
			"lastName": "Allen",
			"email": "xavier.allen@theweb.com",
			"phoneNumber": "1354650571",
			"hireDate": "2003-05-21T20:28:26.527Z",
			"jobId": "jobId33",
			"salary": 169001,
			"commissionPercent": 1.0598817952713744,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId102",
			"firstName": "Lincoln",
			"lastName": "Edwards",
			"email": "lincoln.edwards@theweb.com",
			"phoneNumber": "1476036062",
			"hireDate": "2005-04-24T18:50:18.204Z",
			"jobId": "jobId23",
			"salary": 48993,
			"commissionPercent": 0.49758414218813873,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId103",
			"firstName": "Jake",
			"lastName": "Reed",
			"email": "jake.reed@theweb.com",
			"phoneNumber": "1926965337",
			"hireDate": "1992-02-01T01:00:46.477Z",
			"jobId": "jobId0",
			"salary": 52283,
			"commissionPercent": 0.6846241973045669,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId104",
			"firstName": "Lucy",
			"lastName": "Martin",
			"email": "lucy.martin@theweb.com",
			"phoneNumber": "1538538173",
			"hireDate": "1996-09-20T12:47:03.533Z",
			"jobId": "jobId31",
			"salary": 29827,
			"commissionPercent": 0.5315095942902553,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId105",
			"firstName": "Christian",
			"lastName": "Jackson",
			"email": "christian.jackson@theweb.com",
			"phoneNumber": "1433918622",
			"hireDate": "2005-08-23T04:58:01.875Z",
			"jobId": "jobId46",
			"salary": 59013,
			"commissionPercent": 0.4898380655449547,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId106",
			"firstName": "Jeremiah",
			"lastName": "Brooks",
			"email": "jeremiah.brooks@theweb.com",
			"phoneNumber": "1814980299",
			"hireDate": "1982-08-20T22:57:07.416Z",
			"jobId": "jobId8",
			"salary": 202200,
			"commissionPercent": 0.2901722331006765,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId107",
			"firstName": "Sarah",
			"lastName": "Johnson",
			"email": "sarah.johnson@theweb.com",
			"phoneNumber": "1118385498",
			"hireDate": "2006-02-01T02:50:40.261Z",
			"jobId": "jobId12",
			"salary": 32346,
			"commissionPercent": 1.0410333569727914,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId108",
			"firstName": "Isla",
			"lastName": "Carter",
			"email": "isla.carter@theweb.com",
			"phoneNumber": "1548312762",
			"hireDate": "2013-08-28T20:57:28.229Z",
			"jobId": "jobId46",
			"salary": 115718,
			"commissionPercent": 0.4053105247118852,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId109",
			"firstName": "Elena",
			"lastName": "Johnson",
			"email": "elena.johnson@theweb.com",
			"phoneNumber": "1824132315",
			"hireDate": "1982-07-03T11:28:12.515Z",
			"jobId": "jobId9",
			"salary": 158254,
			"commissionPercent": 0.3830238337294535,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId110",
			"firstName": "Grace",
			"lastName": "Roberts",
			"email": "grace.roberts@theweb.com",
			"phoneNumber": "1456879811",
			"hireDate": "1991-02-10T10:57:15.715Z",
			"jobId": "jobId41",
			"salary": 50506,
			"commissionPercent": 0.640646922083595,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId111",
			"firstName": "Anthony",
			"lastName": "Moore",
			"email": "anthony.moore@theweb.com",
			"phoneNumber": "1875091243",
			"hireDate": "1987-01-24T17:12:34.062Z",
			"jobId": "jobId5",
			"salary": 71337,
			"commissionPercent": 0.564429677310419,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId112",
			"firstName": "Anna",
			"lastName": "Green",
			"email": "anna.green@theweb.com",
			"phoneNumber": "1734254001",
			"hireDate": "1988-04-09T04:41:56.393Z",
			"jobId": "jobId16",
			"salary": 183544,
			"commissionPercent": 1.0705542811940658,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId113",
			"firstName": "Isabelle",
			"lastName": "Bailey",
			"email": "isabelle.bailey@theweb.com",
			"phoneNumber": "1082639621",
			"hireDate": "1995-09-13T12:47:38.831Z",
			"jobId": "jobId38",
			"salary": 64074,
			"commissionPercent": 0.47981816437874036,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId114",
			"firstName": "Blake",
			"lastName": "Hayes",
			"email": "blake.hayes@theweb.com",
			"phoneNumber": "1616431346",
			"hireDate": "1995-09-19T12:30:05.794Z",
			"jobId": "jobId37",
			"salary": 96311,
			"commissionPercent": 0.424530947845133,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId115",
			"firstName": "Stella",
			"lastName": "Rivera",
			"email": "stella.rivera@theweb.com",
			"phoneNumber": "1410724535",
			"hireDate": "1995-06-21T00:34:45.840Z",
			"jobId": "jobId48",
			"salary": 105781,
			"commissionPercent": 1.118335288703329,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId116",
			"firstName": "Nathaniel",
			"lastName": "White",
			"email": "nathaniel.white@theweb.com",
			"phoneNumber": "1499074254",
			"hireDate": "1994-02-07T13:53:03.694Z",
			"jobId": "jobId20",
			"salary": 15945,
			"commissionPercent": 0.3500763099991878,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId117",
			"firstName": "Gabriella",
			"lastName": "Phillips",
			"email": "gabriella.phillips@theweb.com",
			"phoneNumber": "1834747563",
			"hireDate": "1999-12-17T11:43:07.668Z",
			"jobId": "jobId24",
			"salary": 186075,
			"commissionPercent": 0.5204884212031592,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId118",
			"firstName": "Ruby",
			"lastName": "Smith",
			"email": "ruby.smith@theweb.com",
			"phoneNumber": "1663407162",
			"hireDate": "1981-10-24T15:45:11.820Z",
			"jobId": "jobId38",
			"salary": 144029,
			"commissionPercent": 0.47943775139031486,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId119",
			"firstName": "Elise",
			"lastName": "Mitchell",
			"email": "elise.mitchell@theweb.com",
			"phoneNumber": "1151781795",
			"hireDate": "2004-04-05T13:23:54.509Z",
			"jobId": "jobId47",
			"salary": 69475,
			"commissionPercent": 0.5043265991174887,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId120",
			"firstName": "Isabelle",
			"lastName": "Ramirez",
			"email": "isabelle.ramirez@theweb.com",
			"phoneNumber": "1372371861",
			"hireDate": "1984-02-20T03:59:37.195Z",
			"jobId": "jobId5",
			"salary": 95266,
			"commissionPercent": 0.7011110278774814,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId121",
			"firstName": "Elizabeth",
			"lastName": "Bryant",
			"email": "elizabeth.bryant@theweb.com",
			"phoneNumber": "1328020105",
			"hireDate": "2012-11-02T06:14:26.507Z",
			"jobId": "jobId27",
			"salary": 65486,
			"commissionPercent": 0.6179084091649499,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId122",
			"firstName": "Tristan",
			"lastName": "Martinez",
			"email": "tristan.martinez@theweb.com",
			"phoneNumber": "1448132402",
			"hireDate": "2002-05-17T13:15:17.045Z",
			"jobId": "jobId13",
			"salary": 41652,
			"commissionPercent": 1.0086776412781742,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId123",
			"firstName": "Alyssa",
			"lastName": "Murphy",
			"email": "alyssa.murphy@theweb.com",
			"phoneNumber": "1544826513",
			"hireDate": "1982-08-02T18:45:02.945Z",
			"jobId": "jobId28",
			"salary": 209394,
			"commissionPercent": 1.1016254586492646,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId124",
			"firstName": "Isabella",
			"lastName": "Robinson",
			"email": "isabella.robinson@theweb.com",
			"phoneNumber": "1122128706",
			"hireDate": "2004-04-26T02:34:27.382Z",
			"jobId": "jobId9",
			"salary": 140414,
			"commissionPercent": 0.36813649991559105,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId125",
			"firstName": "Charlotte",
			"lastName": "Long",
			"email": "charlotte.long@theweb.com",
			"phoneNumber": "1774924336",
			"hireDate": "1990-01-16T00:51:20.688Z",
			"jobId": "jobId17",
			"salary": 146640,
			"commissionPercent": 0.18317931861146416,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId126",
			"firstName": "Kylie",
			"lastName": "Wilson",
			"email": "kylie.wilson@theweb.com",
			"phoneNumber": "1973375746",
			"hireDate": "1994-12-08T09:37:11.696Z",
			"jobId": "jobId6",
			"salary": 163876,
			"commissionPercent": 0.19963362320117425,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId127",
			"firstName": "Asher",
			"lastName": "Ross",
			"email": "asher.ross@theweb.com",
			"phoneNumber": "1203793875",
			"hireDate": "2007-03-17T22:04:15.436Z",
			"jobId": "jobId22",
			"salary": 33944,
			"commissionPercent": 0.31896675189710944,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId128",
			"firstName": "Alexa",
			"lastName": "Lewis",
			"email": "alexa.lewis@theweb.com",
			"phoneNumber": "1918764902",
			"hireDate": "2001-12-06T10:08:13.903Z",
			"jobId": "jobId7",
			"salary": 66093,
			"commissionPercent": 0.7529852696041478,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId129",
			"firstName": "Claire",
			"lastName": "Martin",
			"email": "claire.martin@theweb.com",
			"phoneNumber": "1498999920",
			"hireDate": "2001-03-23T17:27:03.849Z",
			"jobId": "jobId8",
			"salary": 157369,
			"commissionPercent": 0.3632968660586756,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId130",
			"firstName": "Miles",
			"lastName": "Coleman",
			"email": "miles.coleman@theweb.com",
			"phoneNumber": "1576414641",
			"hireDate": "1994-08-07T14:55:24.959Z",
			"jobId": "jobId40",
			"salary": 55204,
			"commissionPercent": 0.5564647937874384,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId131",
			"firstName": "Makayla",
			"lastName": "Sanchez",
			"email": "makayla.sanchez@theweb.com",
			"phoneNumber": "1803561532",
			"hireDate": "1988-05-09T13:40:28.090Z",
			"jobId": "jobId6",
			"salary": 111078,
			"commissionPercent": 0.5725963852440382,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId132",
			"firstName": "Jack",
			"lastName": "Thompson",
			"email": "jack.thompson@theweb.com",
			"phoneNumber": "1078886593",
			"hireDate": "1991-06-24T10:05:07.374Z",
			"jobId": "jobId16",
			"salary": 132100,
			"commissionPercent": 0.7327801666290775,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId133",
			"firstName": "Charlie",
			"lastName": "Baker",
			"email": "charlie.baker@theweb.com",
			"phoneNumber": "1957345814",
			"hireDate": "1987-07-10T06:30:55.838Z",
			"jobId": "jobId23",
			"salary": 168851,
			"commissionPercent": 0.9817896351141943,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId134",
			"firstName": "Cameron",
			"lastName": "Morgan",
			"email": "cameron.morgan@theweb.com",
			"phoneNumber": "1292887321",
			"hireDate": "1996-01-18T04:07:25.927Z",
			"jobId": "jobId23",
			"salary": 150607,
			"commissionPercent": 0.335519569345892,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId135",
			"firstName": "Zoe",
			"lastName": "Sanchez",
			"email": "zoe.sanchez@theweb.com",
			"phoneNumber": "1508054698",
			"hireDate": "2009-02-20T13:38:16.887Z",
			"jobId": "jobId36",
			"salary": 117962,
			"commissionPercent": 1.1334774369919873,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId136",
			"firstName": "Brayden",
			"lastName": "Ross",
			"email": "brayden.ross@theweb.com",
			"phoneNumber": "1186635466",
			"hireDate": "1998-08-11T02:59:54.630Z",
			"jobId": "jobId20",
			"salary": 37968,
			"commissionPercent": 0.918728515958385,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId137",
			"firstName": "Amelia",
			"lastName": "Gray",
			"email": "amelia.gray@theweb.com",
			"phoneNumber": "1187634399",
			"hireDate": "2003-10-10T00:57:48.793Z",
			"jobId": "jobId0",
			"salary": 114388,
			"commissionPercent": 0.4275362999678446,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId138",
			"firstName": "Ryan",
			"lastName": "Thompson",
			"email": "ryan.thompson@theweb.com",
			"phoneNumber": "1043476844",
			"hireDate": "1986-07-07T21:48:41.772Z",
			"jobId": "jobId34",
			"salary": 71677,
			"commissionPercent": 0.9673816475576927,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId139",
			"firstName": "Bailey",
			"lastName": "Brooks",
			"email": "bailey.brooks@theweb.com",
			"phoneNumber": "1696459835",
			"hireDate": "1995-03-23T07:20:02.041Z",
			"jobId": "jobId42",
			"salary": 181608,
			"commissionPercent": 0.7048463039101319,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId140",
			"firstName": "Ellie",
			"lastName": "Diaz",
			"email": "ellie.diaz@theweb.com",
			"phoneNumber": "1036029864",
			"hireDate": "2013-06-28T23:45:45.784Z",
			"jobId": "jobId44",
			"salary": 143594,
			"commissionPercent": 0.790124149803192,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId141",
			"firstName": "Andrew",
			"lastName": "Harris",
			"email": "andrew.harris@theweb.com",
			"phoneNumber": "1544728729",
			"hireDate": "1988-09-24T20:37:45.018Z",
			"jobId": "jobId2",
			"salary": 187009,
			"commissionPercent": 0.4188798423909498,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId142",
			"firstName": "Adam",
			"lastName": "Scott",
			"email": "adam.scott@theweb.com",
			"phoneNumber": "1584914833",
			"hireDate": "1991-12-07T06:56:08.616Z",
			"jobId": "jobId1",
			"salary": 32551,
			"commissionPercent": 0.31734879371268476,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId143",
			"firstName": "Hailey",
			"lastName": "Murphy",
			"email": "hailey.murphy@theweb.com",
			"phoneNumber": "1273839319",
			"hireDate": "2004-07-08T16:02:52.276Z",
			"jobId": "jobId18",
			"salary": 58182,
			"commissionPercent": 0.9017721798734796,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId144",
			"firstName": "Jack",
			"lastName": "Hughes",
			"email": "jack.hughes@theweb.com",
			"phoneNumber": "1100032449",
			"hireDate": "2006-06-23T06:42:53.711Z",
			"jobId": "jobId19",
			"salary": 185464,
			"commissionPercent": 0.23877759147042496,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId145",
			"firstName": "Dominic",
			"lastName": "Perry",
			"email": "dominic.perry@theweb.com",
			"phoneNumber": "1386045997",
			"hireDate": "2005-11-15T18:29:03.577Z",
			"jobId": "jobId29",
			"salary": 19905,
			"commissionPercent": 0.5641897766335954,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId146",
			"firstName": "Jasmine",
			"lastName": "Rivera",
			"email": "jasmine.rivera@theweb.com",
			"phoneNumber": "1780519959",
			"hireDate": "1997-06-22T10:57:38.273Z",
			"jobId": "jobId25",
			"salary": 60253,
			"commissionPercent": 1.0411679510597194,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId147",
			"firstName": "Christian",
			"lastName": "Wilson",
			"email": "christian.wilson@theweb.com",
			"phoneNumber": "1642299464",
			"hireDate": "1997-05-04T22:34:39.384Z",
			"jobId": "jobId24",
			"salary": 100439,
			"commissionPercent": 0.36991472467990183,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId148",
			"firstName": "Lucas",
			"lastName": "Collins",
			"email": "lucas.collins@theweb.com",
			"phoneNumber": "1293131446",
			"hireDate": "2013-11-19T05:04:59.568Z",
			"jobId": "jobId49",
			"salary": 136825,
			"commissionPercent": 0.5582015825736534,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId149",
			"firstName": "Sebastian",
			"lastName": "Powell",
			"email": "sebastian.powell@theweb.com",
			"phoneNumber": "1197979027",
			"hireDate": "2001-10-17T11:08:07.359Z",
			"jobId": "jobId30",
			"salary": 82415,
			"commissionPercent": 0.9857756483186254,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId150",
			"firstName": "Elijah",
			"lastName": "Carter",
			"email": "elijah.carter@theweb.com",
			"phoneNumber": "1627310373",
			"hireDate": "2002-01-18T14:53:59.393Z",
			"jobId": "jobId20",
			"salary": 90388,
			"commissionPercent": 0.9421442162448256,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId151",
			"firstName": "Ellie",
			"lastName": "Barnes",
			"email": "ellie.barnes@theweb.com",
			"phoneNumber": "1886342132",
			"hireDate": "1997-04-21T12:50:13.666Z",
			"jobId": "jobId42",
			"salary": 142266,
			"commissionPercent": 0.273280637992774,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId152",
			"firstName": "Jason",
			"lastName": "Simmons",
			"email": "jason.simmons@theweb.com",
			"phoneNumber": "1252820024",
			"hireDate": "1983-02-02T05:57:50.265Z",
			"jobId": "jobId47",
			"salary": 105318,
			"commissionPercent": 0.21954664176696234,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId153",
			"firstName": "Avery",
			"lastName": "Kelly",
			"email": "avery.kelly@theweb.com",
			"phoneNumber": "1421165733",
			"hireDate": "1991-01-14T02:13:15.492Z",
			"jobId": "jobId40",
			"salary": 83649,
			"commissionPercent": 0.778063290000068,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId154",
			"firstName": "Kaylee",
			"lastName": "Ross",
			"email": "kaylee.ross@theweb.com",
			"phoneNumber": "1370599991",
			"hireDate": "2002-01-13T08:29:54.400Z",
			"jobId": "jobId7",
			"salary": 145019,
			"commissionPercent": 0.5131021704340727,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId155",
			"firstName": "Adam",
			"lastName": "Scott",
			"email": "adam.scott@theweb.com",
			"phoneNumber": "1342679334",
			"hireDate": "1996-10-07T02:42:41.289Z",
			"jobId": "jobId0",
			"salary": 183124,
			"commissionPercent": 0.40548766233536926,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId156",
			"firstName": "Miles",
			"lastName": "Sanchez",
			"email": "miles.sanchez@theweb.com",
			"phoneNumber": "1923514112",
			"hireDate": "2005-04-21T14:59:04.781Z",
			"jobId": "jobId1",
			"salary": 111593,
			"commissionPercent": 1.0005883184531101,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId157",
			"firstName": "Wyatt",
			"lastName": "Howard",
			"email": "wyatt.howard@theweb.com",
			"phoneNumber": "1099302592",
			"hireDate": "1981-11-21T02:05:40.366Z",
			"jobId": "jobId10",
			"salary": 178202,
			"commissionPercent": 0.22754927080050322,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId158",
			"firstName": "Emily",
			"lastName": "Green",
			"email": "emily.green@theweb.com",
			"phoneNumber": "1993053310",
			"hireDate": "2006-04-29T18:34:29.915Z",
			"jobId": "jobId23",
			"salary": 196954,
			"commissionPercent": 0.17461417449017444,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId159",
			"firstName": "Kylie",
			"lastName": "Wright",
			"email": "kylie.wright@theweb.com",
			"phoneNumber": "1818394266",
			"hireDate": "1990-02-08T18:13:21.685Z",
			"jobId": "jobId4",
			"salary": 202202,
			"commissionPercent": 0.22076945560619152,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId160",
			"firstName": "Landon",
			"lastName": "Rodriguez",
			"email": "landon.rodriguez@theweb.com",
			"phoneNumber": "1099356802",
			"hireDate": "2008-06-06T20:35:57.342Z",
			"jobId": "jobId28",
			"salary": 178940,
			"commissionPercent": 0.40908560812118544,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId161",
			"firstName": "Zachary",
			"lastName": "Walker",
			"email": "zachary.walker@theweb.com",
			"phoneNumber": "1798734644",
			"hireDate": "2004-03-17T08:19:46.458Z",
			"jobId": "jobId17",
			"salary": 59142,
			"commissionPercent": 0.16525761598980346,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId162",
			"firstName": "Alyssa",
			"lastName": "Roberts",
			"email": "alyssa.roberts@theweb.com",
			"phoneNumber": "1020239791",
			"hireDate": "1980-01-03T09:52:36.317Z",
			"jobId": "jobId22",
			"salary": 51024,
			"commissionPercent": 0.9339884117501936,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId163",
			"firstName": "Claire",
			"lastName": "Evans",
			"email": "claire.evans@theweb.com",
			"phoneNumber": "1568477979",
			"hireDate": "1981-12-10T04:30:44.483Z",
			"jobId": "jobId25",
			"salary": 26015,
			"commissionPercent": 0.8072504072074081,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId164",
			"firstName": "Reese",
			"lastName": "Kelly",
			"email": "reese.kelly@theweb.com",
			"phoneNumber": "1201478078",
			"hireDate": "2006-12-22T09:24:39.485Z",
			"jobId": "jobId33",
			"salary": 75310,
			"commissionPercent": 0.2827400676225419,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId165",
			"firstName": "Lily",
			"lastName": "Lewis",
			"email": "lily.lewis@theweb.com",
			"phoneNumber": "1897433546",
			"hireDate": "1991-06-10T17:48:51.325Z",
			"jobId": "jobId9",
			"salary": 32841,
			"commissionPercent": 0.80908279429686,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId166",
			"firstName": "Kendall",
			"lastName": "Williams",
			"email": "kendall.williams@theweb.com",
			"phoneNumber": "1896494812",
			"hireDate": "1993-09-02T01:20:38.791Z",
			"jobId": "jobId9",
			"salary": 87402,
			"commissionPercent": 0.3642282876831361,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId167",
			"firstName": "Jake",
			"lastName": "Cox",
			"email": "jake.cox@theweb.com",
			"phoneNumber": "1837791967",
			"hireDate": "2009-04-24T08:19:07.029Z",
			"jobId": "jobId45",
			"salary": 148803,
			"commissionPercent": 1.0750046059037208,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId168",
			"firstName": "Maria",
			"lastName": "Rivera",
			"email": "maria.rivera@theweb.com",
			"phoneNumber": "1378107360",
			"hireDate": "1995-10-31T11:36:23.660Z",
			"jobId": "jobId13",
			"salary": 36069,
			"commissionPercent": 0.8959611166853879,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId169",
			"firstName": "Noah",
			"lastName": "Harris",
			"email": "noah.harris@theweb.com",
			"phoneNumber": "1083211723",
			"hireDate": "2007-03-23T02:12:56.751Z",
			"jobId": "jobId39",
			"salary": 194701,
			"commissionPercent": 1.0527331671001043,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId170",
			"firstName": "Oliver",
			"lastName": "Ward",
			"email": "oliver.ward@theweb.com",
			"phoneNumber": "1498926918",
			"hireDate": "1993-07-11T04:57:49.446Z",
			"jobId": "jobId4",
			"salary": 107784,
			"commissionPercent": 0.8214446831097425,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId171",
			"firstName": "Anthony",
			"lastName": "Alexander",
			"email": "anthony.alexander@theweb.com",
			"phoneNumber": "1667647323",
			"hireDate": "1999-08-03T13:52:59.719Z",
			"jobId": "jobId1",
			"salary": 192314,
			"commissionPercent": 0.41753174408502713,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId172",
			"firstName": "Alice",
			"lastName": "Hughes",
			"email": "alice.hughes@theweb.com",
			"phoneNumber": "1772268263",
			"hireDate": "2009-08-27T17:34:12.627Z",
			"jobId": "jobId44",
			"salary": 32161,
			"commissionPercent": 0.9481646516255134,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId173",
			"firstName": "Mackenzie",
			"lastName": "Bailey",
			"email": "mackenzie.bailey@theweb.com",
			"phoneNumber": "1984228640",
			"hireDate": "1983-11-11T01:36:01.659Z",
			"jobId": "jobId22",
			"salary": 33242,
			"commissionPercent": 0.5005843468969008,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId174",
			"firstName": "Ryan",
			"lastName": "Brown,",
			"email": "ryan.brown,@theweb.com",
			"phoneNumber": "1627040194",
			"hireDate": "1985-11-21T11:30:58.252Z",
			"jobId": "jobId5",
			"salary": 29973,
			"commissionPercent": 0.5387393293980375,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId175",
			"firstName": "Ryder",
			"lastName": "Richardson",
			"email": "ryder.richardson@theweb.com",
			"phoneNumber": "1840313858",
			"hireDate": "1984-04-01T05:39:31.176Z",
			"jobId": "jobId27",
			"salary": 26064,
			"commissionPercent": 0.3471357303026946,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId176",
			"firstName": "Declan",
			"lastName": "Gray",
			"email": "declan.gray@theweb.com",
			"phoneNumber": "1883850560",
			"hireDate": "1992-09-20T08:52:57.752Z",
			"jobId": "jobId10",
			"salary": 97534,
			"commissionPercent": 0.4611634105896626,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId177",
			"firstName": "Riley",
			"lastName": "Coleman",
			"email": "riley.coleman@theweb.com",
			"phoneNumber": "1272822463",
			"hireDate": "1993-07-13T20:41:18.743Z",
			"jobId": "jobId36",
			"salary": 77263,
			"commissionPercent": 0.5492577835979001,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId178",
			"firstName": "Lyla",
			"lastName": "Hayes",
			"email": "lyla.hayes@theweb.com",
			"phoneNumber": "1532550512",
			"hireDate": "2004-02-05T13:45:01.092Z",
			"jobId": "jobId21",
			"salary": 209393,
			"commissionPercent": 0.15621268995313584,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId179",
			"firstName": "Landon",
			"lastName": "James",
			"email": "landon.james@theweb.com",
			"phoneNumber": "1162028055",
			"hireDate": "1992-04-06T18:12:36.259Z",
			"jobId": "jobId19",
			"salary": 203865,
			"commissionPercent": 0.30347998022649014,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId180",
			"firstName": "Hayden",
			"lastName": "Lewis",
			"email": "hayden.lewis@theweb.com",
			"phoneNumber": "1146362562",
			"hireDate": "1992-10-29T10:21:43.893Z",
			"jobId": "jobId41",
			"salary": 65103,
			"commissionPercent": 0.9924466323877524,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId181",
			"firstName": "Samantha",
			"lastName": "Morris",
			"email": "samantha.morris@theweb.com",
			"phoneNumber": "1303362396",
			"hireDate": "1992-10-12T00:45:35.179Z",
			"jobId": "jobId15",
			"salary": 66685,
			"commissionPercent": 0.39597297933136566,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId182",
			"firstName": "Reese",
			"lastName": "Allen",
			"email": "reese.allen@theweb.com",
			"phoneNumber": "1372335137",
			"hireDate": "2012-08-19T03:41:24.824Z",
			"jobId": "jobId4",
			"salary": 128505,
			"commissionPercent": 0.9404600594096572,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId183",
			"firstName": "James",
			"lastName": "Evans",
			"email": "james.evans@theweb.com",
			"phoneNumber": "1806209737",
			"hireDate": "2010-12-12T15:45:11.271Z",
			"jobId": "jobId36",
			"salary": 199377,
			"commissionPercent": 0.7395777230587145,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId184",
			"firstName": "Leah",
			"lastName": "Campbell",
			"email": "leah.campbell@theweb.com",
			"phoneNumber": "1643899934",
			"hireDate": "2010-08-11T19:41:50.233Z",
			"jobId": "jobId18",
			"salary": 204850,
			"commissionPercent": 0.4153295727181555,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId185",
			"firstName": "Emily",
			"lastName": "King",
			"email": "emily.king@theweb.com",
			"phoneNumber": "1379921825",
			"hireDate": "2012-05-05T18:29:54.100Z",
			"jobId": "jobId18",
			"salary": 73834,
			"commissionPercent": 0.8143057705994826,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId186",
			"firstName": "Ruby",
			"lastName": "Roberts",
			"email": "ruby.roberts@theweb.com",
			"phoneNumber": "1989138318",
			"hireDate": "2007-03-13T15:09:03.312Z",
			"jobId": "jobId39",
			"salary": 10956,
			"commissionPercent": 1.0916559565746813,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId187",
			"firstName": "Riley",
			"lastName": "Coleman",
			"email": "riley.coleman@theweb.com",
			"phoneNumber": "1108157745",
			"hireDate": "1993-05-02T18:57:40.072Z",
			"jobId": "jobId43",
			"salary": 157007,
			"commissionPercent": 0.3980669088391776,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId188",
			"firstName": "Hudson",
			"lastName": "Hill",
			"email": "hudson.hill@theweb.com",
			"phoneNumber": "1544731211",
			"hireDate": "1993-05-05T16:55:09.801Z",
			"jobId": "jobId10",
			"salary": 69926,
			"commissionPercent": 0.47495793375946216,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId189",
			"firstName": "Samuel",
			"lastName": "Powell",
			"email": "samuel.powell@theweb.com",
			"phoneNumber": "1391128680",
			"hireDate": "1984-06-09T14:45:58.295Z",
			"jobId": "jobId8",
			"salary": 156870,
			"commissionPercent": 0.16846513831302565,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId190",
			"firstName": "Micah",
			"lastName": "Foster",
			"email": "micah.foster@theweb.com",
			"phoneNumber": "1379334880",
			"hireDate": "1994-07-02T06:52:24.597Z",
			"jobId": "jobId46",
			"salary": 92857,
			"commissionPercent": 0.4786940409785586,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId191",
			"firstName": "Brandon",
			"lastName": "Hayes",
			"email": "brandon.hayes@theweb.com",
			"phoneNumber": "1623702516",
			"hireDate": "2002-06-26T11:50:49.227Z",
			"jobId": "jobId44",
			"salary": 63121,
			"commissionPercent": 1.1441797521163308,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId192",
			"firstName": "Hayden",
			"lastName": "Jackson",
			"email": "hayden.jackson@theweb.com",
			"phoneNumber": "1231653586",
			"hireDate": "1999-09-05T01:17:37.381Z",
			"jobId": "jobId19",
			"salary": 136707,
			"commissionPercent": 0.1755614927703489,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId193",
			"firstName": "Bailey",
			"lastName": "Scott",
			"email": "bailey.scott@theweb.com",
			"phoneNumber": "1655683075",
			"hireDate": "1987-06-25T12:37:58.615Z",
			"jobId": "jobId36",
			"salary": 96353,
			"commissionPercent": 0.5722842474476891,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId194",
			"firstName": "Evelyn",
			"lastName": "Jenkins",
			"email": "evelyn.jenkins@theweb.com",
			"phoneNumber": "1007545000",
			"hireDate": "1989-08-23T10:55:44.582Z",
			"jobId": "jobId36",
			"salary": 42942,
			"commissionPercent": 0.7322567915096926,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId195",
			"firstName": "Joshua",
			"lastName": "Davis,",
			"email": "joshua.davis,@theweb.com",
			"phoneNumber": "1053505623",
			"hireDate": "1992-06-13T07:13:49.672Z",
			"jobId": "jobId29",
			"salary": 187750,
			"commissionPercent": 0.6443985070472965,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId196",
			"firstName": "Alice",
			"lastName": "Hall",
			"email": "alice.hall@theweb.com",
			"phoneNumber": "1488255526",
			"hireDate": "1995-03-19T12:08:59.032Z",
			"jobId": "jobId26",
			"salary": 166442,
			"commissionPercent": 0.5328542578475629,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId197",
			"firstName": "Luke",
			"lastName": "Hall",
			"email": "luke.hall@theweb.com",
			"phoneNumber": "1792411826",
			"hireDate": "1990-12-01T07:30:16.436Z",
			"jobId": "jobId41",
			"salary": 129964,
			"commissionPercent": 0.4780825373640524,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId198",
			"firstName": "Victoria",
			"lastName": "Brown,",
			"email": "victoria.brown,@theweb.com",
			"phoneNumber": "1704508107",
			"hireDate": "1999-10-14T19:45:46.186Z",
			"jobId": "jobId40",
			"salary": 102213,
			"commissionPercent": 1.001531202000046,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId199",
			"firstName": "Mackenzie",
			"lastName": "Hall",
			"email": "mackenzie.hall@theweb.com",
			"phoneNumber": "1756803172",
			"hireDate": "2006-03-03T01:08:13.677Z",
			"jobId": "jobId10",
			"salary": 189922,
			"commissionPercent": 0.8558576509553127,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId200",
			"firstName": "Hailey",
			"lastName": "Sanders",
			"email": "hailey.sanders@theweb.com",
			"phoneNumber": "1296142568",
			"hireDate": "1984-08-24T13:33:47.417Z",
			"jobId": "jobId19",
			"salary": 200079,
			"commissionPercent": 0.6447001903920081,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId201",
			"firstName": "Bentley",
			"lastName": "Russell",
			"email": "bentley.russell@theweb.com",
			"phoneNumber": "1004770026",
			"hireDate": "1986-03-22T08:39:32.304Z",
			"jobId": "jobId10",
			"salary": 68036,
			"commissionPercent": 0.8739617631120219,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId202",
			"firstName": "Michael",
			"lastName": "Roberts",
			"email": "michael.roberts@theweb.com",
			"phoneNumber": "1121706855",
			"hireDate": "1984-05-27T08:25:53.936Z",
			"jobId": "jobId17",
			"salary": 141480,
			"commissionPercent": 0.8310139467422567,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId203",
			"firstName": "Aiden",
			"lastName": "Lee",
			"email": "aiden.lee@theweb.com",
			"phoneNumber": "1267876647",
			"hireDate": "1981-04-12T22:11:03.411Z",
			"jobId": "jobId45",
			"salary": 169622,
			"commissionPercent": 1.0670659571898864,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId204",
			"firstName": "Kayla",
			"lastName": "Roberts",
			"email": "kayla.roberts@theweb.com",
			"phoneNumber": "1798749315",
			"hireDate": "1980-04-15T05:59:52.523Z",
			"jobId": "jobId47",
			"salary": 46130,
			"commissionPercent": 0.6119237218615187,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId205",
			"firstName": "Harper",
			"lastName": "Griffin",
			"email": "harper.griffin@theweb.com",
			"phoneNumber": "1324294737",
			"hireDate": "1981-12-31T11:22:14.632Z",
			"jobId": "jobId36",
			"salary": 150838,
			"commissionPercent": 1.0651457450458024,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId206",
			"firstName": "Isaiah",
			"lastName": "Rivera",
			"email": "isaiah.rivera@theweb.com",
			"phoneNumber": "1931819936",
			"hireDate": "2006-04-01T06:19:28.444Z",
			"jobId": "jobId8",
			"salary": 56195,
			"commissionPercent": 0.8971185827562814,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId207",
			"firstName": "Mason",
			"lastName": "Lee",
			"email": "mason.lee@theweb.com",
			"phoneNumber": "1592243833",
			"hireDate": "2014-02-28T13:17:15.827Z",
			"jobId": "jobId32",
			"salary": 18189,
			"commissionPercent": 0.27922034145660934,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId208",
			"firstName": "Ella",
			"lastName": "Richardson",
			"email": "ella.richardson@theweb.com",
			"phoneNumber": "1617927848",
			"hireDate": "1992-11-02T06:01:44.803Z",
			"jobId": "jobId29",
			"salary": 179156,
			"commissionPercent": 0.2541820332603645,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId209",
			"firstName": "Ian",
			"lastName": "Evans",
			"email": "ian.evans@theweb.com",
			"phoneNumber": "1613637665",
			"hireDate": "1995-12-21T01:43:47.211Z",
			"jobId": "jobId24",
			"salary": 117427,
			"commissionPercent": 0.807269482978726,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId210",
			"firstName": "Jake",
			"lastName": "Gray",
			"email": "jake.gray@theweb.com",
			"phoneNumber": "1745957665",
			"hireDate": "1999-12-09T18:58:35.123Z",
			"jobId": "jobId17",
			"salary": 172767,
			"commissionPercent": 0.9554144680000344,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId211",
			"firstName": "Amelia",
			"lastName": "Cox",
			"email": "amelia.cox@theweb.com",
			"phoneNumber": "1407351768",
			"hireDate": "2005-09-14T00:11:58.813Z",
			"jobId": "jobId30",
			"salary": 138193,
			"commissionPercent": 0.7490482291047863,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId212",
			"firstName": "Austin",
			"lastName": "Clark",
			"email": "austin.clark@theweb.com",
			"phoneNumber": "1311047945",
			"hireDate": "1986-09-20T17:19:11.330Z",
			"jobId": "jobId13",
			"salary": 25643,
			"commissionPercent": 0.5205088160506458,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId213",
			"firstName": "Jacob",
			"lastName": "Carter",
			"email": "jacob.carter@theweb.com",
			"phoneNumber": "1399241419",
			"hireDate": "1990-03-05T13:24:27.488Z",
			"jobId": "jobId25",
			"salary": 114006,
			"commissionPercent": 0.925897803096377,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId214",
			"firstName": "Olivia",
			"lastName": "Sanchez",
			"email": "olivia.sanchez@theweb.com",
			"phoneNumber": "1182131429",
			"hireDate": "2002-10-21T04:18:14.111Z",
			"jobId": "jobId33",
			"salary": 178951,
			"commissionPercent": 0.473843802647845,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId215",
			"firstName": "Brianna",
			"lastName": "Edwards",
			"email": "brianna.edwards@theweb.com",
			"phoneNumber": "1678886382",
			"hireDate": "2009-09-26T05:51:26.552Z",
			"jobId": "jobId14",
			"salary": 166431,
			"commissionPercent": 0.8142777001313305,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId216",
			"firstName": "Lillian",
			"lastName": "Walker",
			"email": "lillian.walker@theweb.com",
			"phoneNumber": "1950625620",
			"hireDate": "1987-05-13T07:06:00.414Z",
			"jobId": "jobId31",
			"salary": 24729,
			"commissionPercent": 0.1645243515453839,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId217",
			"firstName": "Claire",
			"lastName": "Jones,",
			"email": "claire.jones,@theweb.com",
			"phoneNumber": "1146716602",
			"hireDate": "2005-12-26T14:58:06.725Z",
			"jobId": "jobId34",
			"salary": 151828,
			"commissionPercent": 0.2719437493452733,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId218",
			"firstName": "Bella",
			"lastName": "Carter",
			"email": "bella.carter@theweb.com",
			"phoneNumber": "1704344952",
			"hireDate": "1995-12-28T19:35:03.261Z",
			"jobId": "jobId35",
			"salary": 10824,
			"commissionPercent": 1.0307712129590327,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId219",
			"firstName": "Olivia",
			"lastName": "Anderson",
			"email": "olivia.anderson@theweb.com",
			"phoneNumber": "1827455890",
			"hireDate": "1998-03-03T09:43:04.173Z",
			"jobId": "jobId43",
			"salary": 64848,
			"commissionPercent": 0.1910246694032268,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId220",
			"firstName": "Julian",
			"lastName": "Phillips",
			"email": "julian.phillips@theweb.com",
			"phoneNumber": "1625311804",
			"hireDate": "2009-12-22T22:26:02.026Z",
			"jobId": "jobId20",
			"salary": 138507,
			"commissionPercent": 0.8971844807590835,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId221",
			"firstName": "Adam",
			"lastName": "Phillips",
			"email": "adam.phillips@theweb.com",
			"phoneNumber": "1116148196",
			"hireDate": "2002-08-13T05:29:38.777Z",
			"jobId": "jobId11",
			"salary": 188275,
			"commissionPercent": 0.8321390513430761,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId222",
			"firstName": "Harrison",
			"lastName": "Taylor",
			"email": "harrison.taylor@theweb.com",
			"phoneNumber": "1443399282",
			"hireDate": "1997-12-08T03:03:07.343Z",
			"jobId": "jobId26",
			"salary": 61973,
			"commissionPercent": 0.9084296952935617,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId223",
			"firstName": "Charlotte",
			"lastName": "Carter",
			"email": "charlotte.carter@theweb.com",
			"phoneNumber": "1500057174",
			"hireDate": "1983-04-30T17:49:07.286Z",
			"jobId": "jobId13",
			"salary": 129163,
			"commissionPercent": 0.47726406604973926,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId224",
			"firstName": "Evelyn",
			"lastName": "Henderson",
			"email": "evelyn.henderson@theweb.com",
			"phoneNumber": "1181989917",
			"hireDate": "1991-12-23T06:28:13.108Z",
			"jobId": "jobId30",
			"salary": 104780,
			"commissionPercent": 0.8757528053217633,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId225",
			"firstName": "Luke",
			"lastName": "Peterson",
			"email": "luke.peterson@theweb.com",
			"phoneNumber": "1047805671",
			"hireDate": "1983-02-26T16:51:11.221Z",
			"jobId": "jobId11",
			"salary": 171592,
			"commissionPercent": 0.8238224067254513,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId226",
			"firstName": "Liam",
			"lastName": "Morgan",
			"email": "liam.morgan@theweb.com",
			"phoneNumber": "1304738101",
			"hireDate": "2003-04-26T15:24:18.208Z",
			"jobId": "jobId7",
			"salary": 52299,
			"commissionPercent": 0.8173118432385796,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId227",
			"firstName": "Benjamin",
			"lastName": "Martin",
			"email": "benjamin.martin@theweb.com",
			"phoneNumber": "1022884326",
			"hireDate": "1998-02-15T11:19:14.985Z",
			"jobId": "jobId33",
			"salary": 133407,
			"commissionPercent": 0.4930634539575277,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId228",
			"firstName": "Grace",
			"lastName": "Edwards",
			"email": "grace.edwards@theweb.com",
			"phoneNumber": "1897149047",
			"hireDate": "1997-08-01T05:37:44.953Z",
			"jobId": "jobId40",
			"salary": 111854,
			"commissionPercent": 0.23765719046430486,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId229",
			"firstName": "Jackson",
			"lastName": "Perry",
			"email": "jackson.perry@theweb.com",
			"phoneNumber": "1140183690",
			"hireDate": "1985-01-03T17:33:18.927Z",
			"jobId": "jobId15",
			"salary": 169476,
			"commissionPercent": 0.9353081595063363,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId230",
			"firstName": "Carter",
			"lastName": "Powell",
			"email": "carter.powell@theweb.com",
			"phoneNumber": "1373414130",
			"hireDate": "1985-04-26T23:45:27.890Z",
			"jobId": "jobId24",
			"salary": 114920,
			"commissionPercent": 0.6615278295048629,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId231",
			"firstName": "Ella",
			"lastName": "Sanders",
			"email": "ella.sanders@theweb.com",
			"phoneNumber": "1767409241",
			"hireDate": "1980-03-11T07:54:24.353Z",
			"jobId": "jobId37",
			"salary": 143388,
			"commissionPercent": 0.6020834056429848,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId232",
			"firstName": "Isabelle",
			"lastName": "Washington",
			"email": "isabelle.washington@theweb.com",
			"phoneNumber": "1932480513",
			"hireDate": "2005-11-06T09:04:15.006Z",
			"jobId": "jobId2",
			"salary": 177648,
			"commissionPercent": 0.7579408670360203,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId233",
			"firstName": "Eva",
			"lastName": "Diaz",
			"email": "eva.diaz@theweb.com",
			"phoneNumber": "1176294500",
			"hireDate": "1992-11-26T01:40:59.866Z",
			"jobId": "jobId20",
			"salary": 200255,
			"commissionPercent": 0.5602308136933442,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId234",
			"firstName": "Brody",
			"lastName": "Adams",
			"email": "brody.adams@theweb.com",
			"phoneNumber": "1856617564",
			"hireDate": "2011-04-14T21:06:16.830Z",
			"jobId": "jobId37",
			"salary": 140309,
			"commissionPercent": 0.4060456519629779,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId235",
			"firstName": "Adam",
			"lastName": "Patterson",
			"email": "adam.patterson@theweb.com",
			"phoneNumber": "1831951073",
			"hireDate": "1994-10-15T15:33:57.521Z",
			"jobId": "jobId19",
			"salary": 137468,
			"commissionPercent": 0.5262604094744233,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId236",
			"firstName": "Micah",
			"lastName": "Brooks",
			"email": "micah.brooks@theweb.com",
			"phoneNumber": "1389185283",
			"hireDate": "1989-04-21T15:54:53.000Z",
			"jobId": "jobId3",
			"salary": 107932,
			"commissionPercent": 0.33781390990599813,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId237",
			"firstName": "Annabelle",
			"lastName": "Henderson",
			"email": "annabelle.henderson@theweb.com",
			"phoneNumber": "1366574298",
			"hireDate": "2004-06-24T04:52:46.441Z",
			"jobId": "jobId16",
			"salary": 92103,
			"commissionPercent": 0.5354089243990957,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId238",
			"firstName": "Carson",
			"lastName": "Rogers",
			"email": "carson.rogers@theweb.com",
			"phoneNumber": "1649064579",
			"hireDate": "1985-02-21T23:13:37.173Z",
			"jobId": "jobId40",
			"salary": 142762,
			"commissionPercent": 1.040142145973616,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId239",
			"firstName": "Nathan",
			"lastName": "Wright",
			"email": "nathan.wright@theweb.com",
			"phoneNumber": "1365551517",
			"hireDate": "1999-12-23T06:40:03.148Z",
			"jobId": "jobId20",
			"salary": 56685,
			"commissionPercent": 0.2997288348292898,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId240",
			"firstName": "Morgan",
			"lastName": "Bailey",
			"email": "morgan.bailey@theweb.com",
			"phoneNumber": "1465262978",
			"hireDate": "1992-11-15T22:22:05.488Z",
			"jobId": "jobId32",
			"salary": 110849,
			"commissionPercent": 0.5236260097594098,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId241",
			"firstName": "Nora",
			"lastName": "Anderson",
			"email": "nora.anderson@theweb.com",
			"phoneNumber": "1068029502",
			"hireDate": "1989-08-05T06:43:40.469Z",
			"jobId": "jobId42",
			"salary": 111170,
			"commissionPercent": 0.3670928939724857,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId242",
			"firstName": "Ryder",
			"lastName": "Parker",
			"email": "ryder.parker@theweb.com",
			"phoneNumber": "1759571878",
			"hireDate": "1992-10-17T12:33:09.782Z",
			"jobId": "jobId26",
			"salary": 118116,
			"commissionPercent": 0.7299275387345331,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId243",
			"firstName": "Peyton",
			"lastName": "Edwards",
			"email": "peyton.edwards@theweb.com",
			"phoneNumber": "1322276321",
			"hireDate": "2012-01-16T13:10:19.141Z",
			"jobId": "jobId46",
			"salary": 185854,
			"commissionPercent": 0.5012021531040588,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId244",
			"firstName": "Noah",
			"lastName": "Russell",
			"email": "noah.russell@theweb.com",
			"phoneNumber": "1624644471",
			"hireDate": "1980-04-09T16:04:51.909Z",
			"jobId": "jobId14",
			"salary": 77640,
			"commissionPercent": 0.9906787523482622,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId245",
			"firstName": "Julian",
			"lastName": "Turner",
			"email": "julian.turner@theweb.com",
			"phoneNumber": "1935103129",
			"hireDate": "1981-05-30T02:08:51.137Z",
			"jobId": "jobId34",
			"salary": 166198,
			"commissionPercent": 0.8060518358069463,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId246",
			"firstName": "Jackson",
			"lastName": "Lopez",
			"email": "jackson.lopez@theweb.com",
			"phoneNumber": "1521242558",
			"hireDate": "1993-08-12T23:12:29.216Z",
			"jobId": "jobId14",
			"salary": 109743,
			"commissionPercent": 0.6511784442297189,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId247",
			"firstName": "Eva",
			"lastName": "Taylor",
			"email": "eva.taylor@theweb.com",
			"phoneNumber": "1837378433",
			"hireDate": "2009-06-10T00:48:53.651Z",
			"jobId": "jobId41",
			"salary": 55230,
			"commissionPercent": 0.9376032321400701,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId248",
			"firstName": "Eli",
			"lastName": "Kelly",
			"email": "eli.kelly@theweb.com",
			"phoneNumber": "1240025650",
			"hireDate": "2001-11-23T10:02:42.789Z",
			"jobId": "jobId37",
			"salary": 183386,
			"commissionPercent": 0.9697258236767704,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId249",
			"firstName": "David",
			"lastName": "Scott",
			"email": "david.scott@theweb.com",
			"phoneNumber": "1636888410",
			"hireDate": "1983-12-25T04:58:26.213Z",
			"jobId": "jobId16",
			"salary": 205542,
			"commissionPercent": 1.0719159623813523,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId250",
			"firstName": "Andrew",
			"lastName": "Peterson",
			"email": "andrew.peterson@theweb.com",
			"phoneNumber": "1728646639",
			"hireDate": "1981-02-20T20:14:40.771Z",
			"jobId": "jobId35",
			"salary": 121930,
			"commissionPercent": 0.74811789041223,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId251",
			"firstName": "Nevaeh",
			"lastName": "Ward",
			"email": "nevaeh.ward@theweb.com",
			"phoneNumber": "1651822628",
			"hireDate": "1993-04-07T05:35:29.527Z",
			"jobId": "jobId47",
			"salary": 69515,
			"commissionPercent": 0.41956057966824656,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId252",
			"firstName": "Reagan",
			"lastName": "Edwards",
			"email": "reagan.edwards@theweb.com",
			"phoneNumber": "1773739473",
			"hireDate": "1986-12-30T11:38:42.078Z",
			"jobId": "jobId3",
			"salary": 130446,
			"commissionPercent": 0.5208362148207676,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId253",
			"firstName": "Charlotte",
			"lastName": "Flores",
			"email": "charlotte.flores@theweb.com",
			"phoneNumber": "1158333339",
			"hireDate": "1989-07-03T10:59:01.008Z",
			"jobId": "jobId21",
			"salary": 194852,
			"commissionPercent": 0.3647424660210591,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId254",
			"firstName": "Savannah",
			"lastName": "Wright",
			"email": "savannah.wright@theweb.com",
			"phoneNumber": "1194403430",
			"hireDate": "1999-01-06T10:19:01.304Z",
			"jobId": "jobId38",
			"salary": 130284,
			"commissionPercent": 0.3089138375376591,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId255",
			"firstName": "Lily",
			"lastName": "Campbell",
			"email": "lily.campbell@theweb.com",
			"phoneNumber": "1256691548",
			"hireDate": "1994-09-26T01:02:32.328Z",
			"jobId": "jobId4",
			"salary": 136688,
			"commissionPercent": 0.759771249996675,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId256",
			"firstName": "Peyton",
			"lastName": "Washington",
			"email": "peyton.washington@theweb.com",
			"phoneNumber": "1750119923",
			"hireDate": "2005-01-11T18:46:53.358Z",
			"jobId": "jobId27",
			"salary": 137437,
			"commissionPercent": 0.5159850909681004,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId257",
			"firstName": "Hailey",
			"lastName": "Henderson",
			"email": "hailey.henderson@theweb.com",
			"phoneNumber": "1318372175",
			"hireDate": "2001-08-12T10:44:45.064Z",
			"jobId": "jobId12",
			"salary": 160223,
			"commissionPercent": 0.6035743559930303,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId258",
			"firstName": "Owen",
			"lastName": "Miller,",
			"email": "owen.miller,@theweb.com",
			"phoneNumber": "1936702096",
			"hireDate": "2003-06-28T00:45:53.078Z",
			"jobId": "jobId33",
			"salary": 204036,
			"commissionPercent": 0.9364174453244961,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId259",
			"firstName": "Isabelle",
			"lastName": "Bell",
			"email": "isabelle.bell@theweb.com",
			"phoneNumber": "1507120359",
			"hireDate": "2004-03-06T22:43:10.990Z",
			"jobId": "jobId18",
			"salary": 164188,
			"commissionPercent": 0.21097836691451496,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId260",
			"firstName": "Christopher",
			"lastName": "Phillips",
			"email": "christopher.phillips@theweb.com",
			"phoneNumber": "1704184548",
			"hireDate": "2006-04-18T08:13:10.382Z",
			"jobId": "jobId5",
			"salary": 59389,
			"commissionPercent": 0.1842109303920024,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId261",
			"firstName": "Aria",
			"lastName": "Ramirez",
			"email": "aria.ramirez@theweb.com",
			"phoneNumber": "1092897264",
			"hireDate": "2002-11-28T06:23:22.878Z",
			"jobId": "jobId12",
			"salary": 205272,
			"commissionPercent": 1.037852701273403,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId262",
			"firstName": "Brayden",
			"lastName": "Kelly",
			"email": "brayden.kelly@theweb.com",
			"phoneNumber": "1500022274",
			"hireDate": "1990-10-26T02:00:15.767Z",
			"jobId": "jobId10",
			"salary": 182098,
			"commissionPercent": 0.28708565622691606,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId263",
			"firstName": "Hannah",
			"lastName": "Mitchell",
			"email": "hannah.mitchell@theweb.com",
			"phoneNumber": "1114776610",
			"hireDate": "1989-11-30T15:50:50.132Z",
			"jobId": "jobId18",
			"salary": 200583,
			"commissionPercent": 0.26849529158904406,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId264",
			"firstName": "Christopher",
			"lastName": "Richardson",
			"email": "christopher.richardson@theweb.com",
			"phoneNumber": "1607450970",
			"hireDate": "2012-02-06T14:55:58.528Z",
			"jobId": "jobId49",
			"salary": 10318,
			"commissionPercent": 0.799611299340876,
			"managerId": "managerId",
			"departmentId": "departmentId8",
			"photo": {}
		},
		{
			"id": "employeeId265",
			"firstName": "Isabella",
			"lastName": "Miller,",
			"email": "isabella.miller,@theweb.com",
			"phoneNumber": "1757007979",
			"hireDate": "2008-12-05T03:06:01.183Z",
			"jobId": "jobId20",
			"salary": 147267,
			"commissionPercent": 0.7038381072149164,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId266",
			"firstName": "Benjamin",
			"lastName": "King",
			"email": "benjamin.king@theweb.com",
			"phoneNumber": "1601543757",
			"hireDate": "1985-01-29T03:40:13.240Z",
			"jobId": "jobId5",
			"salary": 160431,
			"commissionPercent": 0.6009645195103829,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId267",
			"firstName": "Andrew",
			"lastName": "Cox",
			"email": "andrew.cox@theweb.com",
			"phoneNumber": "1733093333",
			"hireDate": "2004-02-02T09:46:15.569Z",
			"jobId": "jobId22",
			"salary": 151905,
			"commissionPercent": 0.8944875470096695,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId268",
			"firstName": "Clara",
			"lastName": "Barnes",
			"email": "clara.barnes@theweb.com",
			"phoneNumber": "1070944352",
			"hireDate": "1987-06-25T07:12:51.393Z",
			"jobId": "jobId39",
			"salary": 148288,
			"commissionPercent": 0.8352111455723875,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		},
		{
			"id": "employeeId269",
			"firstName": "Eliana",
			"lastName": "Martinez",
			"email": "eliana.martinez@theweb.com",
			"phoneNumber": "1753753198",
			"hireDate": "1992-12-12T18:00:05.993Z",
			"jobId": "jobId15",
			"salary": 35336,
			"commissionPercent": 0.6185600093260349,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId270",
			"firstName": "Molly",
			"lastName": "Taylor",
			"email": "molly.taylor@theweb.com",
			"phoneNumber": "1421868973",
			"hireDate": "1981-12-18T07:09:06.302Z",
			"jobId": "jobId2",
			"salary": 62734,
			"commissionPercent": 0.1667781956705435,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId271",
			"firstName": "Max",
			"lastName": "Foster",
			"email": "max.foster@theweb.com",
			"phoneNumber": "1491067233",
			"hireDate": "2005-04-15T15:37:16.041Z",
			"jobId": "jobId48",
			"salary": 12595,
			"commissionPercent": 0.9984836702295686,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId272",
			"firstName": "Anna",
			"lastName": "Miller,",
			"email": "anna.miller,@theweb.com",
			"phoneNumber": "1486272680",
			"hireDate": "1982-07-25T11:33:17.514Z",
			"jobId": "jobId20",
			"salary": 157820,
			"commissionPercent": 1.1215843238177747,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId273",
			"firstName": "Isabelle",
			"lastName": "Russell",
			"email": "isabelle.russell@theweb.com",
			"phoneNumber": "1868438890",
			"hireDate": "1984-02-14T17:43:47.028Z",
			"jobId": "jobId23",
			"salary": 142981,
			"commissionPercent": 1.0142542112373014,
			"managerId": "managerId",
			"departmentId": "departmentId3",
			"photo": {}
		},
		{
			"id": "employeeId274",
			"firstName": "Hudson",
			"lastName": "Gonzalez",
			"email": "hudson.gonzalez@theweb.com",
			"phoneNumber": "1120890751",
			"hireDate": "1983-03-04T21:19:29.149Z",
			"jobId": "jobId40",
			"salary": 61153,
			"commissionPercent": 0.7582833753450403,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId275",
			"firstName": "Evan",
			"lastName": "Moore",
			"email": "evan.moore@theweb.com",
			"phoneNumber": "1486934252",
			"hireDate": "2007-12-10T17:13:25.963Z",
			"jobId": "jobId41",
			"salary": 80490,
			"commissionPercent": 0.3829169253871999,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId276",
			"firstName": "Lily",
			"lastName": "Diaz",
			"email": "lily.diaz@theweb.com",
			"phoneNumber": "1583384756",
			"hireDate": "2004-04-01T04:44:12.628Z",
			"jobId": "jobId18",
			"salary": 143004,
			"commissionPercent": 0.2744605408142827,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId277",
			"firstName": "Charlotte",
			"lastName": "Carter",
			"email": "charlotte.carter@theweb.com",
			"phoneNumber": "1555721947",
			"hireDate": "1989-08-23T02:28:14.431Z",
			"jobId": "jobId10",
			"salary": 188535,
			"commissionPercent": 0.4081606992899477,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId278",
			"firstName": "Kylie",
			"lastName": "Campbell",
			"email": "kylie.campbell@theweb.com",
			"phoneNumber": "1908410585",
			"hireDate": "1999-11-12T21:46:57.761Z",
			"jobId": "jobId35",
			"salary": 140756,
			"commissionPercent": 0.22600675200673578,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId279",
			"firstName": "Brooke",
			"lastName": "Alexander",
			"email": "brooke.alexander@theweb.com",
			"phoneNumber": "1156506182",
			"hireDate": "2013-04-27T18:21:34.180Z",
			"jobId": "jobId13",
			"salary": 61146,
			"commissionPercent": 0.9602884158661625,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId280",
			"firstName": "Austin",
			"lastName": "Davis,",
			"email": "austin.davis,@theweb.com",
			"phoneNumber": "1384130293",
			"hireDate": "1999-03-13T07:24:49.784Z",
			"jobId": "jobId37",
			"salary": 150895,
			"commissionPercent": 0.893400325732712,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId281",
			"firstName": "Alyssa",
			"lastName": "Ramirez",
			"email": "alyssa.ramirez@theweb.com",
			"phoneNumber": "1189821907",
			"hireDate": "1993-09-05T09:58:55.662Z",
			"jobId": "jobId12",
			"salary": 55465,
			"commissionPercent": 1.039186428322667,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId282",
			"firstName": "Jack",
			"lastName": "Reed",
			"email": "jack.reed@theweb.com",
			"phoneNumber": "1382992583",
			"hireDate": "2001-03-05T12:23:56.677Z",
			"jobId": "jobId2",
			"salary": 29338,
			"commissionPercent": 0.2318404870683722,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId283",
			"firstName": "Savannah",
			"lastName": "Walker",
			"email": "savannah.walker@theweb.com",
			"phoneNumber": "1360939302",
			"hireDate": "1987-11-23T01:53:58.803Z",
			"jobId": "jobId31",
			"salary": 65226,
			"commissionPercent": 0.5988404719175472,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId284",
			"firstName": "Layla",
			"lastName": "Thompson",
			"email": "layla.thompson@theweb.com",
			"phoneNumber": "1597534167",
			"hireDate": "2011-05-31T12:49:49.618Z",
			"jobId": "jobId4",
			"salary": 118549,
			"commissionPercent": 1.0646111693137574,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId285",
			"firstName": "Brody",
			"lastName": "Gonzalez",
			"email": "brody.gonzalez@theweb.com",
			"phoneNumber": "1060825756",
			"hireDate": "2010-07-03T02:56:38.133Z",
			"jobId": "jobId15",
			"salary": 142054,
			"commissionPercent": 1.0525388531600068,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId286",
			"firstName": "Abigail",
			"lastName": "Clark",
			"email": "abigail.clark@theweb.com",
			"phoneNumber": "1674554052",
			"hireDate": "1999-01-09T03:00:59.021Z",
			"jobId": "jobId22",
			"salary": 109636,
			"commissionPercent": 1.018715686070674,
			"managerId": "managerId",
			"departmentId": "departmentId7",
			"photo": {}
		},
		{
			"id": "employeeId287",
			"firstName": "Joseph",
			"lastName": "Adams",
			"email": "joseph.adams@theweb.com",
			"phoneNumber": "1920780466",
			"hireDate": "1992-04-01T07:44:16.809Z",
			"jobId": "jobId46",
			"salary": 198337,
			"commissionPercent": 0.9180164794576989,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId288",
			"firstName": "Isaac",
			"lastName": "Alexander",
			"email": "isaac.alexander@theweb.com",
			"phoneNumber": "1984338945",
			"hireDate": "2010-01-25T04:29:09.677Z",
			"jobId": "jobId22",
			"salary": 140411,
			"commissionPercent": 0.3474080557057492,
			"managerId": "managerId",
			"departmentId": "departmentId5",
			"photo": {}
		},
		{
			"id": "employeeId289",
			"firstName": "Mia",
			"lastName": "Roberts",
			"email": "mia.roberts@theweb.com",
			"phoneNumber": "1577987738",
			"hireDate": "2013-01-19T20:53:31.668Z",
			"jobId": "jobId11",
			"salary": 107372,
			"commissionPercent": 0.8114007355185372,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId290",
			"firstName": "Evelyn",
			"lastName": "Carter",
			"email": "evelyn.carter@theweb.com",
			"phoneNumber": "1788008516",
			"hireDate": "2013-11-28T21:41:47.975Z",
			"jobId": "jobId16",
			"salary": 73769,
			"commissionPercent": 0.5710535916401901,
			"managerId": "managerId",
			"departmentId": "departmentId9",
			"photo": {}
		},
		{
			"id": "employeeId291",
			"firstName": "Eliana",
			"lastName": "Walker",
			"email": "eliana.walker@theweb.com",
			"phoneNumber": "1421299439",
			"hireDate": "1998-03-22T19:14:25.006Z",
			"jobId": "jobId26",
			"salary": 122049,
			"commissionPercent": 0.5733488891733164,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId292",
			"firstName": "Emma",
			"lastName": "Nelson",
			"email": "emma.nelson@theweb.com",
			"phoneNumber": "1186564673",
			"hireDate": "1990-03-18T18:32:18.966Z",
			"jobId": "jobId19",
			"salary": 121203,
			"commissionPercent": 0.19809173606373295,
			"managerId": "managerId",
			"departmentId": "departmentId2",
			"photo": {}
		},
		{
			"id": "employeeId293",
			"firstName": "Nora",
			"lastName": "Gonzales",
			"email": "nora.gonzales@theweb.com",
			"phoneNumber": "1974759869",
			"hireDate": "1991-02-08T12:46:50.117Z",
			"jobId": "jobId28",
			"salary": 33592,
			"commissionPercent": 0.613038895605814,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId294",
			"firstName": "Aria",
			"lastName": "Ross",
			"email": "aria.ross@theweb.com",
			"phoneNumber": "1397715416",
			"hireDate": "1984-06-29T21:33:59.337Z",
			"jobId": "jobId13",
			"salary": 146263,
			"commissionPercent": 0.6434625463022506,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId295",
			"firstName": "Colin",
			"lastName": "Martinez",
			"email": "colin.martinez@theweb.com",
			"phoneNumber": "1999171161",
			"hireDate": "1982-09-16T18:01:37.898Z",
			"jobId": "jobId21",
			"salary": 155345,
			"commissionPercent": 0.35134750246538815,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId296",
			"firstName": "Reagan",
			"lastName": "Powell",
			"email": "reagan.powell@theweb.com",
			"phoneNumber": "1475846058",
			"hireDate": "2002-02-18T01:31:45.204Z",
			"jobId": "jobId19",
			"salary": 154498,
			"commissionPercent": 0.46156332546735845,
			"managerId": "managerId",
			"departmentId": "departmentId4",
			"photo": {}
		},
		{
			"id": "employeeId297",
			"firstName": "Aiden",
			"lastName": "Perez",
			"email": "aiden.perez@theweb.com",
			"phoneNumber": "1143849438",
			"hireDate": "1991-03-23T19:54:01.006Z",
			"jobId": "jobId35",
			"salary": 59996,
			"commissionPercent": 0.8342329698528604,
			"managerId": "managerId",
			"departmentId": "departmentId1",
			"photo": {}
		},
		{
			"id": "employeeId298",
			"firstName": "Christopher",
			"lastName": "Jenkins",
			"email": "christopher.jenkins@theweb.com",
			"phoneNumber": "1048746271",
			"hireDate": "2006-11-25T09:45:16.791Z",
			"jobId": "jobId33",
			"salary": 184918,
			"commissionPercent": 0.8767387920575377,
			"managerId": "managerId",
			"departmentId": "departmentId6",
			"photo": {}
		},
		{
			"id": "employeeId299",
			"firstName": "Ryan",
			"lastName": "Rivera",
			"email": "ryan.rivera@theweb.com",
			"phoneNumber": "1502050983",
			"hireDate": "1997-12-16T09:43:01.919Z",
			"jobId": "jobId8",
			"salary": 162635,
			"commissionPercent": 0.5830040622539864,
			"managerId": "managerId",
			"departmentId": "departmentId0",
			"photo": {}
		}
	],
	"Department": [
		{
			"id": "departmentId0",
			"name": "Licenses",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId1",
			"name": "IT",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId2",
			"name": "Purchasing",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId3",
			"name": "Human Resources",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId4",
			"name": "Operational",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId5",
			"name": "Sales",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId6",
			"name": "Customer Service",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId7",
			"name": "Organizational",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId8",
			"name": "Financial",
			"managerId": "managerId",
			"locationId": "locationId"
		},
		{
			"id": "departmentId9",
			"name": "Inventory",
			"managerId": "managerId",
			"locationId": "locationId"
		}
	],
	"Location": [
		{
			"id": "locationId",
			"streetAddress": "dummyStreetAddress",
			"postalCode": "dummyPostalCode",
			"city": "dummyCity",
			"stateProvince": "dummyStateProvince",
			"countryId": 1
		}
	],
	"Country": [
		{
			"id": 1,
			"name": "dummyCountryName",
			"regionId": "regionId"
		},
		{
			"id": 2,
			"name": "dummyCountryName",
			"regionId": "regionId"
		}
	],
	"Region": [
		{
			"id": "regionId",
			"name": "dummyRegionName"
		},
		{
			"id": "regionId2",
			"name": "dummyRegionName2"
		},
		{
			"id": "regionId3",
			"name": "dummyRegionName3"
		}
	],
	"Holiday": [],
	"DummyTable": [],
	"CrossColumnTable": [
		{
			"integer1": 0,
			"integer2": 0,
			"string1": "string1_00",
			"string2": "string2_0"
		},
		{
			"integer1": 1,
			"integer2": 10,
			"string1": "string1_01",
			"string2": "string2_10"
		},
		{
			"integer1": 2,
			"integer2": 20,
			"string1": "string1_02",
			"string2": "string2_20"
		},
		{
			"integer1": 3,
			"integer2": 30,
			"string1": "string1_03",
			"string2": "string2_30"
		},
		{
			"integer1": 4,
			"integer2": 40,
			"string1": "string1_04",
			"string2": "string2_40"
		},
		{
			"integer1": 5,
			"integer2": 50,
			"string1": "string1_05",
			"string2": "string2_50"
		},
		{
			"integer1": 6,
			"integer2": 60,
			"string1": "string1_06",
			"string2": "string2_60"
		},
		{
			"integer1": 7,
			"integer2": 70,
			"string1": "string1_07",
			"string2": "string2_70"
		},
		{
			"integer1": 8,
			"integer2": 80,
			"string1": "string1_08",
			"string2": "string2_80"
		},
		{
			"integer1": 9,
			"integer2": 90,
			"string1": "string1_09",
			"string2": "string2_90"
		},
		{
			"integer1": 10,
			"integer2": 100,
			"string1": null,
			"string2": "string2_100"
		},
		{
			"integer1": 11,
			"integer2": 110,
			"string1": "string1_11",
			"string2": "string2_110"
		},
		{
			"integer1": 12,
			"integer2": 120,
			"string1": null,
			"string2": "string2_120"
		},
		{
			"integer1": 13,
			"integer2": 130,
			"string1": "string1_13",
			"string2": "string2_130"
		},
		{
			"integer1": 14,
			"integer2": 140,
			"string1": null,
			"string2": "string2_140"
		},
		{
			"integer1": 15,
			"integer2": 150,
			"string1": "string1_15",
			"string2": "string2_150"
		},
		{
			"integer1": 16,
			"integer2": 160,
			"string1": "string1_16",
			"string2": null
		},
		{
			"integer1": 17,
			"integer2": 170,
			"string1": "string1_17",
			"string2": "string2_170"
		},
		{
			"integer1": 18,
			"integer2": 180,
			"string1": "string1_18",
			"string2": null
		},
		{
			"integer1": 19,
			"integer2": 190,
			"string1": "string1_19",
			"string2": "string2_190"
		}
	]
});
const job = db.table("Job");

const results = await db.select().from(job).where(job.col("minSalary").gte(300000)).orderBy(job.col("minSalary"), Order.ASC).exec();

console.log(results);

const exportedDb = await db.export();

console.log(exportedDb);

console.log(await db.import(exportedDb.tables));

