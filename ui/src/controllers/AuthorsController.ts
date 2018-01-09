import Vue from 'vue'
import { Route } from 'vue-router'
import Component from 'vue-class-component'
import DotvueComponent from '../dotvue/DotvueComponent'
import ListTemplate from '../views/authors/list.html'
import ViewTemplate from '../views/authors/view.html'
import Author from '../models/Author'
import AuthorsRepository from '../repositories/AuthorsRepository'
import PostList from '../components/post-list/PostList'

@DotvueComponent(module, {
    template: ListTemplate
})
export class List extends Vue {

    public authors: Author[]

    public static async loadDataAsyncStatic(to: Route) {
        return await AuthorsRepository.all()
    }
    public loadDataAsync(to: Route){
        return List.loadDataAsyncStatic(to);
    }

    public static data: Author[]
    public async beforeRouteEnter(to: Route, from: Route, next: any){
        List.data = Author.convertAll(await List.loadDataAsyncStatic(to))
        next()
    }

    public created() {
        this.authors = List.data
    }

}

@DotvueComponent(module, {
    template: ViewTemplate,
    components: { 'post-list': PostList }
})
export class View extends Vue {

    public author: Author

    public static async loadDataAsyncStatic(to: Route) {
        return await AuthorsRepository.one(Number(to.params.id))
    }
    public loadDataAsync(to: Route){
        return View.loadDataAsyncStatic(to);
    }

    public static data: Author
    public async beforeRouteEnter(to: Route, from: Route, next: any){
        View.data = new Author(await View.loadDataAsyncStatic(to))
        next()
    }

    public async beforeRouteUpdate(to: Route, from: Route, next: any){
        this.author = new Author(await View.loadDataAsyncStatic(to))
        next()
    }

    public created() {
        this.author = View.data
    }

}
