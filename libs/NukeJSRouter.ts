interface NukeJSRouterInterface {
    import(lists: Array<{
        url: string,
        page: Promise<any>
    }>, notFound: NukeJSItemRouter): void
}
interface NukeJSItemRouter {
    url: string,
    page: Promise<any>
}
export default class NukeJSRouter implements NukeJSRouterInterface {
    private listRouter: Array<NukeJSItemRouter> = [];
    private notFound: NukeJSItemRouter | undefined;
    private _route: any = {
        params: {},
        query: {}
    }
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
                    //console.log("check", item.url);
                    item.page.then(async (page) => {
                        await this.makeQuery();
                        let _window: any = window;
                        if (_window.nukepage) {
                            delete _window.nukepage;
                        }
                        if (_window.route) {
                            delete _window.route;
                        }
                        _window.route = this._route;

                        _window.nukepage = new page.default();
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
                const params = item.url.split('/');
                const pathname = window.location.pathname.split('/');
                if (params.length === pathname.length && item.url.includes('$')) {
                    try {
                        let checkRouter = 0;
                        pathname.forEach((pathn, index) => {
                            if (params[index] === pathn) {
                                checkRouter += 1;
                            }
                            if (params[index].includes('$')) {
                                const param = params[index].toString().replace('$', '');
                                this._route.params[param] = pathn;
                                checkRouter += 1;
                            }
                        });
                        if (checkRouter === params.length) {
                            console.log("OK");
                            item.page.then(async (page) => {
                                await this.makeQuery();
                                let _window: any = window;
                                if (_window.nukepage) {
                                    delete _window.nukepage;
                                }
                                if (_window.route) {
                                    delete _window.route;
                                }
                                _window.route = this._route;

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
                    } catch (e: any) {
                        console.log(e.toString())
                    }
                }
                if (index === (this.listRouter.length - 1) && notFound === true) {
                    this.notFound?.page.then(async (page) => {
                        await this.makeQuery();
                        let _window: any = window;
                        if (_window.nukepage) {
                            delete _window.nukepage;
                        }
                        if (_window.route) {
                            delete _window.route;
                        }
                        _window.route = this._route;

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
    private makeQuery() {
        this._route.query = {}
        let fullQuery = window.location.href.split("?");
        if (fullQuery.length === 1) {
            return;
        }
        const query = fullQuery[1].split('&');
        query.forEach((item, index) => {
            const data = item.split('=');
            if (data[0]) {
                this._route.query[data[0].toString()] = data[1] ? data[1] : "";
            }
        })
    }
}