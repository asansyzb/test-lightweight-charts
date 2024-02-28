import { Chart } from '@/components/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SingleValueData } from 'lightweight-charts';

const atomToken =
	'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9';
const ntrnToken = 'untrn';

interface SeriesData {
	series: SingleValueData[];
	priceChangePercentage: number;
	minValue: number;
	maxValue: number;
}

interface ApiResponse {
	result: {
		data: {
			json: {
				[key in typeof atomToken | typeof ntrnToken]: SeriesData;
			};
		};
	};
}

async function load(): Promise<ApiResponse | null> {
	const json = {
		json: {
			tokens: [atomToken, ntrnToken],
			chainId: 'neutron-1',
			dateRange: 'D7',
		},
	};

	const encodedJson = encodeURI(JSON.stringify(json));

	const link = `https://app.astroport.fi/api/trpc/charts.prices?input=${encodedJson}`;

	try {
		const result = await fetch(link);
		return result.json();
	} catch (e) {
		return null;
	}
}

enum Pairs {
	ATOM_NTRN = 'atomntrn',
	ATOM_USD = 'atomusd',
	NTRN_USD = 'ntrnusd',
}

function calcSeriesMinMaxAverage(series: SingleValueData[]) {
	const values = series.map((s) => s.value);
	const average = values.reduce((x, acc) => (acc += x)) / values.length;
	const min = Math.min(...values);
	const max = Math.max(...values);

	return { min, max, average };
}

function isDefined<T>(argument: T | undefined): argument is T {
	return argument !== undefined;
}

function calcNewSeries(
	a: SingleValueData[],
	b: SingleValueData[],
): SingleValueData[] {
	return a
		.map((x) => {
			const foundSingleValueData = b.find((y) => x.time === y.time);

			if (!foundSingleValueData) {
				return;
			}

			return {
				value: (x.value * 100) / (foundSingleValueData.value * 100),
				time: x.time,
			};
		})
		.filter(isDefined);
}

export default async function Page(): Promise<JSX.Element> {
	const response = await load();

	if (!response) {
		return (
			<main>
				<p>Something went wrong. Please, try again</p>
			</main>
		);
	}

	const data = response.result.data.json;

	const { series: atomSeries } = data[atomToken];
	const { series: ntrnSeries } = data[ntrnToken];

	const atomntrnSeries = calcNewSeries(atomSeries, ntrnSeries);

	const {
		min: atomMin,
		max: atomMax,
		average: atomAverage,
	} = calcSeriesMinMaxAverage(atomSeries);
	const {
		min: ntrnMin,
		max: ntrnMax,
		average: ntrnAverage,
	} = calcSeriesMinMaxAverage(ntrnSeries);
	const {
		min: atomntrnMin,
		max: atomntrnMax,
		average: atomntrnAverage,
	} = calcSeriesMinMaxAverage(atomntrnSeries);

	return (
		<main>
			<Tabs defaultValue={Pairs.ATOM_NTRN} className="container">
				<TabsList className="grid grid-cols-3">
					<TabsTrigger value={Pairs.ATOM_NTRN}>ATOM/NTRN</TabsTrigger>
					<TabsTrigger value={Pairs.ATOM_USD}>ATOM/USD</TabsTrigger>
					<TabsTrigger value={Pairs.NTRN_USD}>NTRN/USD</TabsTrigger>
				</TabsList>
				<TabsContent value={Pairs.ATOM_NTRN}>
					<Chart
						data={atomntrnSeries}
						minPrice={atomntrnMin}
						maxPrice={atomntrnMax}
						averagePrice={atomntrnAverage}
					/>
				</TabsContent>
				<TabsContent value={Pairs.ATOM_USD}>
					<Chart
						data={atomSeries}
						minPrice={atomMin}
						maxPrice={atomMax}
						averagePrice={atomAverage}
					/>
				</TabsContent>
				<TabsContent value={Pairs.NTRN_USD}>
					<Chart
						data={ntrnSeries}
						minPrice={ntrnMin}
						maxPrice={ntrnMax}
						averagePrice={ntrnAverage}
					/>
				</TabsContent>
			</Tabs>
		</main>
	);
}
