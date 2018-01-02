import Vue from 'vue'
import { Route } from 'vue-router'
import DotvueComponent from '../dotvue/DotvueComponent'
import Post from '../models/Post'
import PostRepository from '../repositories/PostsRepository'
import ListTemplate from '../views/posts/list.html'
import ViewTemplate from '../views/posts/view.html'
import PostList from '../components/post-list/PostList'

@DotvueComponent(module, {
    template: ListTemplate,
    components: { 'post-list': PostList }
})
export class List extends Vue {

    public posts = new Array<Post>();

    public async loadDataAsync(to: Route) {
        return await PostRepository.all()
    }

    private async routeChangeAsync(to: Route, from: Route, next: any) {
        this.posts = Post.convertAll(await this.loadDataAsync(to))
        next(true)
    }
    public beforeRouteEnter = this.routeChangeAsync;
}

@DotvueComponent(module, {
    template: ViewTemplate
})
export class View extends Vue {

    public post = new Post();

    public async loadDataAsync(to: Route) {
        return await PostRepository.one(Number(to.params.id))
    }

    private async routeChangeAsync(to: Route, from: Route, next: any) {
        this.post = new Post(await this.loadDataAsync(to))
        next(true)
    }
    public beforeRouteEnter = this.routeChangeAsync;
    public beforeRouteUpdate = this.routeChangeAsync;
}
