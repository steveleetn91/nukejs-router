interface NukeJSRouterInterface {
    import(lists: Array<{
        url: string,
        page: Promise<any>
    }>, notFound: NukeJSItemRouter): void;
}
interface NukeJSItemRouter {
    url: string,
    page: Promise<any>
}
export default class NukeJSRouter implements NukeJSRouterInterface {
    private listRouter: Array<NukeJSItemRouter> = [];
    private notFound: NukeJSItemRouter | undefined;
    import(lists: Array<NukeJSItemRouter>, notFound: NukeJSItemRouter): void {
        this.listRouter = lists;
        this.notFound = notFound;
        this.walk();
    }
    private walk(oldUrl: string = ""): void {
        if (window.location.pathname !== oldUrl) {
            let notFound = true;
            this.listRouter.forEach(async (item, index) => {

                if (item.url === window.location.pathname) {
                    notFound = false;
                    console.log("check", item.url);
                    item.page.then(async (page) => {
                        let _window: any = window;
                        if (_window.nukepage) {
                            delete _window.nukepage;
                        }
                        _window.nukepage = new page.default();
                        await _window.nukepage.beforeRender();
                        await _window.nukepage.render();
                        await _window.nukepage.afterRender();
                        try {
                            window = _window;
                        } catch (e) {
                            //ignore warning 
                        }
                    });
                }
                if (index === (this.listRouter.length - 1) && notFound === true) {
                    this.notFound?.page.then(async (page) => {
                        let _window: any = window;
                        if (_window.nukepage) {
                            delete _window.nukepage;
                        }
                        _window.nukepage = new page.default();
                        await _window.nukepage.beforeRender();
                        await _window.nukepage.render();
                        await _window.nukepage.afterRender();
                        try {
                            window = _window;
                        } catch (e) {
                            //ignore warning 
                        }
                    })
                }
            });
        }
        oldUrl = window.location.pathname;
        setTimeout(async () => {
            //console.log("check",window.location.pathname);
            await this.walk(oldUrl);
        }, 300);
    }
}