import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // we are on the server and have to do "Cross Namespace Service Communication"
		// ex: http://SERVICENAME.NAMESPACE.svc.cluster.local
		// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local: sending our request to ingress-nginx
		// req.headers: contains cookies and hostname
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        // we are on the browser
        return axios.create({
            baseURL: '/'
        });
    }
};

export default buildClient;