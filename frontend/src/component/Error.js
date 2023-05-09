function Error(props){
    return (
        <div>
            {props?.message || "Something went wrong"}
        </div>
    )
}

export default Error;