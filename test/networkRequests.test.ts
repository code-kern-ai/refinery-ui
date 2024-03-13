import { getOverviewStats, getIsDemo } from "../src/services/base/organization";


describe('Integration Test for getOverviewStats', () => {
    it('successfully fetches overview statistics from the backend', async () => {
        // const resultPromise = new Promise((resolve) => {
        //     console.log("REACHED_1")
        //     getOverviewStats((result) => {
        //         console.log("REACHED_2")
        //         resolve(result);
        //     });
        // });

        // const result = await resultPromise;
        // console.log(result);

        // getOverviewStats((data) => {
        //     console.log(data);
        // });

        getIsDemo((data) => {
            console.log(data);
        });
    });
});
