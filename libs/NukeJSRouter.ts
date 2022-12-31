interface NukeJSRouterInterface {
    import(lists : Array<{
        url : string,
        page : Promise<any>
    }>,notFound : NukeJSItemRouter) : void;
}
interface NukeJSItemRouter {
    url : string,
    page : Promise<any>
}
export default class NukeJSRouter implements NukeJSRouterInterface{
    private listRouter : Array<NukeJSItemRouter> | undefined;
    private notFound : NukeJSItemRouter | undefined;
    import(lists : Array<NukeJSItemRouter>,notFound : NukeJSItemRouter): void {
        this.listRouter = lists;
        this.notFound = notFound;
        this.walk();
    }
    private walk(oldUrl : string = ""): void {
        this.listRouter?.forEach((item,index) => {
            const currentlyItem = item.url;
            if(window.location.pathname === oldUrl) {
                return;
            }
            oldUrl = window.location.pathname;
            if(currentlyItem === window.location.pathname) {
                item.page.then( async (page) => {
                    let _window : any = window;
                    _window.nukepage = new page.default();
                    await _window.nukepage.beforeRender();
                    await _window.nukepage.render();
                    await _window.nukepage.afterRender();
                    try {
                        window = _window;
                    }catch(e) {
                        //ignore warning 
                    }
                });
            }
        });
        setTimeout( async () => {
            await this.walk(oldUrl);
        },300);
    }
}