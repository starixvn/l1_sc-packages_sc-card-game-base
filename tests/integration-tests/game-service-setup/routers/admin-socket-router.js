import { Routers } from "../../../../src";

export default class AdminSocketRouter extends Routers.AdminSocketRouter {
    verify() {
        return true;
    }
}
