import Vue from 'vue'
import { Route } from 'vue-router'
import Component from 'vue-class-component'
import DotvueComponent from '../dotvue/DotvueComponent'
import ListTemplate from '../views/authors/list.html'
import ViewTemplate from '../views/authors/view.html'
import Author from '../models/Author'
import AuthorsRepository from '../repositories/AuthorsRepository'
import PostList from '../components/post-list/PostList'

const dataKeyList = "authors/list"

@DotvueComponent(module, {
    template: ListTemplate
})
export class List extends Vue {

    public authors = new Array<Author>();

    public async loadDataAsync(to: Route) {
        return await AuthorsRepository.all()
    }

    private async routeChangeAsync(to: Route, from: Route, next: any) {
        this.authors = Author.convertAll(await this.loadDataAsync(to))
        next(true)
    }
    public beforeRouteEnter = this.routeChangeAsync;
}

@DotvueComponent(module, {
    template: ViewTemplate,
    components: { 'post-list': PostList }
})
export class View extends Vue {

    public author = new Author();

    public async loadDataAsync(to: Route) {
        return await AuthorsRepository.one(Number(to.params.id))
    }

    private async routeChangeAsync(to: Route, from: Route, next: any) {
        this.author = new Author(await this.loadDataAsync(to))
        next(true)
    }
    public beforeRouteEnter = this.routeChangeAsync;
    public beforeRouteUpdate = this.routeChangeAsync;

}
