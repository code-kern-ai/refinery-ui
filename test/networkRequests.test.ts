import { getProjectByProjectId } from '../src/services/base/project';

describe('Integration Test for getProjectByProjectId', () => {
    it('getProjectByProjectId: OK', async () => {
        const fastapi_result = await new Promise<void>((resolve) => {
            getProjectByProjectId("db66e355-28d5-4807-9594-a46ccff53b94", (result) => {
                resolve(result);
            });
        });

        const graphql_result = {
            "data": {
                "projectByProjectId": {
                    "id": "db66e355-28d5-4807-9594-a46ccff53b94",
                    "name": "Clickbait",
                    "description": "A simple binary classification project for detecting clickbait articles.",
                    "projectType": null,
                    "tokenizer": "en_core_web_sm",
                    "numDataScaleUploaded": 3000
                }
            }
        }

        expect(fastapi_result).toEqual(graphql_result);
    });
});
