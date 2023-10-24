
export interface BaseResponse<T> {
    /**
     * 1 represents error, 0 represents success
     */
    code: number,
    /**
     * when code == 1, data == undefined
     */
    data?: T,
    msg: string
}

