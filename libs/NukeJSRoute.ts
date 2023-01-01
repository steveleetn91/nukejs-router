interface NukeJSRouteInterface {
    params : Object,
    query : Object
}
export default class NukeJSRoute implements NukeJSRouteInterface {
    params: Object = {}
    query: Object = {}
    constructor() {
        let _window : any = window;
        if(_window.route) {
            this.params = _window.route.params;
            this.query = _window.route.query;    
        }
    }
}