import {ref} from "vue";
import {downloadImages} from "./useFiles.js";

function fetchImageStarList() {
    try {
        let items = utools.dbStorage.getItem('imageStarList')

        if (items && typeof items === 'string') {
            const result = JSON.parse(items)
            if (!Array.isArray(result)) {
                return result
            }
            return {}
        }

        return {}
    } catch (e) {
        return {}
    }
}

function updateImageStarList(items) {
    utools.dbStorage.setItem('imageStarList', JSON.stringify(items))
}

// 是否已收藏
const starIcons = ref(fetchImageStarList())
const starEmojiList = ref([])

export default function () {

    const checkIfStarred = (imgSrc) => {
        return !!starIcons.value[imgSrc]
    }

    const switchStar = (imgObj) => {
        const {imgSrc, fileSrc} = imgObj

        if (checkIfStarred(imgSrc)) {
            delete starIcons.value[imgSrc]
        } else {
            starIcons.value[imgSrc] = fileSrc
        }
        updateImageStarList(starIcons.value)
    }

    const fetchImageStarDisplayList = () => {
        const imageLinks = Object.entries(starIcons.value).map(val => val[0])
        downloadImages(imageLinks)
        return Object.entries(starIcons.value).map(val => ({imgSrc: val[0], fileSrc: val[1]}))
    }

    starEmojiList.value = fetchImageStarDisplayList()

    return {
        checkIfStarred,
        switchStar,
        starEmojiList,
    }

}
