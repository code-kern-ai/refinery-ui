import { getProjectByProjectId } from '../src/services/base/project';

describe('Integration Test for getProjectByProjectId', () => {
    it('getProjectByProjectId: OK', async () => {

        const projectId = "4235c9b2-5cd7-4d90-adcd-871b32205bf6";

        const fastapi_result = await new Promise<void>((resolve) => {
            getProjectByProjectId(projectId, (result) => {
                resolve(result);
            });
        });

        const graphql_result = {
            "data": {
                "projectByProjectId": {
                    "id": projectId,
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
