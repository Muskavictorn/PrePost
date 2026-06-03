// import {type RouteConfig,index,route} from "@react-router/dev/routes"
import { useLocation } from "react-router";
// export default [
//     index("routes/home.tsx"),
//     route('visualize/:id','routes/visualizer/$id.tsx')
// ] satisfies RouteConfig

const VisualizerId = () => {
    const location = useLocation();
    const { initialImage, name } = location.state || {};
    return (
        <section>
            <h1>{name || 'Untitled Project'}</h1>
            <div className="visualizer">
                {initialImage && (
                    <div className="image-contaniner">
                        <h2>Source Image</h2>
                        <img src={initialImage} alt="source"/>
                    </div>
                )}
            </div>
        </section>
    )
}

export default VisualizerId;