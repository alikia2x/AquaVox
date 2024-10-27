export default function(fullname: string){
    if (!fullname) return '';
    return fullname.split('.').slice(0, -1).join('.')
}