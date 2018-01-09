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
                    let loadDataAsyncFunction = (Component as any).options.methods.loadDataAsync
                    if (loadDataAsyncFunction) {
                        promises.push((async (key: string) => {
                            if (ssrData[key]){
                                initialData.set(key, ssrData[key])
                                delete ssrData[key]
                            } else {
                                let data = await loadDataAsyncFunction(router.currentRoute)
                                initialData.set(key, data)
                                ssrData[key] = data
                            }
                            (Component as any).options.methods.loadDataAsync = (to:Route) => {
                                console.log("overridden")
                                if (initialData.has(key)){
                                    let data = initialData.get(key)
                                    initialData.delete(key)
                                    console.log("from SSR")
                                    return data
                                }
                                console.log("from Source")
                                return loadDataAsyncFunction(to);
                            }
                        })(String(i)))
                        i++
                    }
                })

                Promise.all<void>(promises)
                    .then(resolve)
                    .catch(reject)

            }, reject)
        })
    }

}
