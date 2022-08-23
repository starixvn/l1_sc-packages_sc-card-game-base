import { Core } from "sc-game-base";

export default class AdminSocketRouter extends Core.Routers.BaseAdminSocketRouter {
    verify() {
        return true;
    }
}
