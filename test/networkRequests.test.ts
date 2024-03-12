import { getOverviewStats } from "@/src/services/base/organization";


describe('Integration Test for getOverviewStats', () => {
    it('successfully fetches overview statistics from the backend', async () => {
        const resultPromise = new Promise((resolve) => {
            getOverviewStats((result) => {
                resolve(result);
            });
        });

        const result = await resultPromise;
        console.log(result);
        // expect(result).toHaveProperty('stat1');
        // expect(result).toHaveProperty('stat2');
    });
});
