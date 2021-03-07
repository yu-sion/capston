import React from "react";
import axios from "axios";
import "../css/note.css";

export default class Note extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      text : null,
    }
    this.url = {
      getNote : "http://54.146.88.72:3000/memo/get/", // videoId, userId
      setNote : "http://54.146.88.72:3000/memo/write/",
    }
  }
  dragEvent = () => {
    if(document.getSelection){
      const selectText = document.getSelection();
      return selectText;
    }
  }

  setSort = (e) => {
    const text = this.dragEvent();
    if(text.toString() == ""){
      console.log("N");
    }else {
      console.log("Y");
    }
    const element = e.target;
    this.text.style.textAlign = element.value;
  }

  setSize = () => {
    const selectElement_Note_Size = document.getElementById("Note_Size_Set");
    const selectElement_Note_Text = this.text;
    selectElement_Note_Size.addEventListener('change', ()=>{
      const text = this.dragEvent();
      if(text == "")
      selectElement_Note_Text.style.fontSize = selectElement_Note_Size.value + "px";
      const a = selectElement_Note_Size.value + "px";
    });

    for(let i = 3; i <= 20; i++){
      let optionChild = document.createElement('option');
      optionChild.value = i * 2;
      optionChild.innerHTML = i * 2;
      if(i * 2 == 12){
        optionChild.setAttribute('selected', true);
      }
      selectElement_Note_Size.appendChild(optionChild);
    }
  }

  setColor = () => {
    const selectElement_Note_Color = document.getElementById("Note_Color_Set");
    const selectElement_Note_Text = this.text;
    selectElement_Note_Color.addEventListener('change', ()=>{
      console.log(selectElement_Note_Color.value);
      selectElement_Note_Text.style.fontColor = selectElement_Note_Color.value;
    });
    const colorList = [
      "rgb(0, 0, 0)",
      "rgb(255, 0, 0)",
      "rgb(255, 255, 0)",
      "rgb(255, 0, 255)",
      "rgb(255, 255, 255)",
      "rgb(0, 255, 0)",
      "rgb(0, 255, 255)",
      "rgb(0, 0, 255)",
    ];
    for(let i = 0; i < colorList.length; i++){
      const childElement = document.createElement('div');
      const mychild = document.createElement('button');
      mychild.style.backgroundColor = colorList[i];
      childElement.appendChild(mychild);
      childElement.value = colorList[i];
      childElement.style.background = colorList[i];
      if(colorList[i] == "rgb(0, 0, 0)"){
        childElement.setAttribute('selected', true);
      }
      selectElement_Note_Color.appendChild(childElement);
    }
  }

  getNote = async () => {
    const url = this.url.getNote + this.props.videoId + "/" + this.props.stdId;
    await axios.post(url).then(res => {
      console.log(res);
      if(res.data.result[0] != null){
        this.setState({
          text : res.data.result[0].content,
        });
      }
    });
  }
  save = async () => {
    const noteElement = document.getElementById('Note_Text');
    const url = this.url.setNote + this.props.videoId + "/" + this.props.stdId;
    const data = { content : noteElement.innerHTML}
    await axios.post(url, {data}).then( req => {
      console.log(req);
    }).catch(err => {console.error(err)});
    console.log("set Note");
  }
  componentDidMount(){
    this.text = document.getElementById('Note_Text');
    this.getNote();
    this.setSize();
    // this.setColor();
  }
  componentDidUpdate(prevProps, prevState){
    if(this.state.text != prevState.text){
      document.getElementById('Note_Text').innerHTML = this.state.text;
    }
  }

  render(){
    return (
      <div className="Note_Body">
        <div className="Note_Option">
          <div className="Note_Option_Size" id="Note_Option_Size">
            <select id="Note_Size_Set">
            </select>
          </div>
          {/* <div className="Note_Option_Color" id="Note_Option_Color">
             <select id="Note_Color_Set">
             </select>
           </div> */}
          <div className="Note_Option_TextSort_Btn">
            <button className="Note_Text_Sort_Btn" onClick={this.setSort} value="left"> LEFT </button>
            <button className="Note_Text_Sort_Btn" onClick={this.setSort} value="center"> CENTER </button>
            <button className="Note_Text_Sort_Btn" onClick={this.setSort} value="right"> RIGHT </button>
          </div>
          <div>
            <button className="Note_Save_Text" onClick={this.save}> SAVE </button>
          </div>
        </div>
        <div className="Note_Text_Frame">
          <div contentEditable='true' className="Note_Text_Body" id="Note_Text" />
        </div>
      </div>
    )
  }
}
