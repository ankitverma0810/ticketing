// if we ever have to load any global css file then we have to create such _app.js file.
// nextjs will load this app file.
import 'bootstrap/dist/css/bootstrap.css';

import buildClient from '../api/build-client';
import Header from '../components/Header';


// Component will be available automatically by nextjs as a prop depending upon the page we are loading. 
const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div className="container">
            <Header currentUser={currentUser} />
            <Component currentUser={currentUser} {...pageProps} />
        </div>
    );
};

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    //executing getInitialProps method of child components.
    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }

    return {
        pageProps,
        ...data // currentUser
    }
}

export default AppComponent;