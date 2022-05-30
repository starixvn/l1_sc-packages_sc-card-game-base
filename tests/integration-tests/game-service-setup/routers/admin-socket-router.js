import { AdminSocketRouter as BaseAdminSocketRouter } from "../../../../src/routers/admin-socket-router";

export default class AdminSocketRouter extends BaseAdminSocketRouter {
    verify() {
        return true;
    }
}
