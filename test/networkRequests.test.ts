import { getOverviewStats, getIsDemo } from "../src/services/base/organization";


describe('Integration Test for getOverviewStats', () => {
    it('successfully fetches overview statistics from the backend', async () => {
        getOverviewStats((data) => {
            console.log(data);
        });

        // getIsDemo((data) => {
        //     console.log(data);
        // });
    });
});
