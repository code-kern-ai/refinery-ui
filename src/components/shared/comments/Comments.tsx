import CommentsMainSection from "./CommentsMainSection";

export default function Comments() {
    return (<>

        <CommentsMainSection open={true} toggleOpen={() => console.log()} />
    </>)
}