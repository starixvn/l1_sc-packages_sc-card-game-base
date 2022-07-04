import { startServiceProcess, startSetupDataProcess } from "./stubs/test-jobs";
import { signinTest } from "./sign-in.test";
import { ingameTest } from "./ingame.test";
import { settleTest } from "./settle.test";
import { adminSetResultTest } from "./admin-set-result.test";
import { cutCardTest } from "./cut-card.test";
import { remainingTimeTest } from "./remaining-time.test";

let processStartService;
const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 50000;

beforeAll((done) => {
    jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
    startSetupDataProcess(() => {
        console.log("done setup db");
        processStartService = startServiceProcess(() => {
            setTimeout(() => {
                console.log("start tests");
                done();
            }, 15000);
        });
    });
});

afterAll(() => {
    processStartService.stdin.pause();
    processStartService.kill();
});

cutCardTest();
remainingTimeTest();
signinTest();
settleTest();
ingameTest();
adminSetResultTest();
