import Vue from 'vue'
import VueRouter, { Route } from 'vue-router'

declare const window: any;

export default class DotvueApp {

    initLoad: Promise<any>

    initialData = new Map<string, any>();

    ssrData: { [key: string]: any } = {}

    routesInMap = new Array<Route>();

    vueComponent: Vue

    constructor(router: VueRouter, template: string) {

        this.vueComponent = new Vue({
            router,
            template: template,
            computed: {
                dotvueApp: () => { return this }
            }
        })

        if (typeof (window) !== 'undefined' && window.DotvueInitialData) {
            this.ssrData = window.DotvueInitialData
            delete window.DotvueInitialData
        }

        this.initLoad = new Promise((resolve, reject) => {
            router.onReady(() => {
                let matchedComponents = router.getMatchedComponents()
                if (!matchedComponents.length) {
                    reject({ code: 404 })
                }

                let promises = new Array<Promise<void>>();
                let i=0

                let initialData = this.initialData
                let ssrData = this.ssrData
                
                matchedComponents.map(Component => {
                    
                    if ((Component as any).options.loadDataAsync && (Component as any).options.loadDataAsync instanceof Promise) {
                        promises.push((async (key: string) => {
                            let loadDataAsyncFunction = (Component as any).options.loadDataAsync
                            if (ssrData[key]){
                                initialData.set(key, ssrData[key])
                                delete ssrData[key]
                            } else {
                                initialData.set(key, await loadDataAsyncFunction(router.currentRoute))
                            }
                            (Component as any).options.loadDataAsync = (to:Route) => {
                                if (initialData.has(key)){
                                    let data = initialData.get(key)
                                    initialData.delete(key)
                                    return data
                                }
                                return loadDataAsyncFunction(to);
                            }
                        })(String(i)))
                        i++
                    }
                })

                Promise.all<void>(promises)
                    .then(resolve)
                    .catch(reject);

            }, reject)
        })
    }

}
