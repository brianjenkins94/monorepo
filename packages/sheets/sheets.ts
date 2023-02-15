import { getOauth2Client } from "./providers/googleOAuth";
import { sheets as sheetsApi } from "googleapis/build/src/apis/sheets";
import type { sheets_v4 as Sheets } from "googleapis/build/src/apis/sheets";

const oauth2Client = await getOauth2Client();

const sheets = sheetsApi("v4");

export class Sheet {
	private readonly spreadSheetId;

	public constructor(spreadSheetId: string) {
		this.spreadSheetId = spreadSheetId;
	}

	public async get(range: string) {
		const data = [];

		for (const row of (await sheets.spreadsheets.values.get({
			"auth": oauth2Client,
			"spreadsheetId": this.spreadSheetId,
			"range": range
		} as Sheets.Params$Resource$Spreadsheets$Values$Get))["data"]["values"]) {
			if (Array.isArray(row)) {
				const columns = [];

				for (const cell of row) {
					try {
						columns.push(JSON.parse(cell));
					} catch (error) {
						columns.push(cell);
					}
				}

				data.push(columns);
			} else {
				data.push(JSON.parse(row));
			}
		}

		return data;
	}

	public async getMaxRange(sheetName: string) {
		return (await sheets.spreadsheets.get({
			"auth": oauth2Client,
			"spreadsheetId": this.spreadSheetId,
			"ranges": [sheetName]
		} as Sheets.Params$Resource$Spreadsheets$Get))["data"]["sheets"][0]["properties"]["gridProperties"];
	}

	public update(range: string, data: unknown[] | unknown[][]) {
		if (!data.every(Array.isArray)) {
			data = [data];
		}

		return sheets.spreadsheets.values.update({
			"auth": oauth2Client,
			"spreadsheetId": this.spreadSheetId,
			"range": range,
			"valueInputOption": "RAW",
			"resource": {
				"values": data // [[key, parseInt(await get("Sheet1!B" + index), 10) + value]]
			}
		} as Sheets.Params$Resource$Spreadsheets$Values$Update);
	}

	public append(range: string, data: unknown[] | unknown[][]) {
		if (!data.every(Array.isArray)) {
			data = [data];
		}

		return sheets.spreadsheets.values.append({
			"auth": oauth2Client,
			"spreadsheetId": this.spreadSheetId,
			"range": range,
			"valueInputOption": "RAW",
			"resource": {
				"values": data // [[key, value]]
			}
		} as Sheets.Params$Resource$Spreadsheets$Values$Append);
	}
}
