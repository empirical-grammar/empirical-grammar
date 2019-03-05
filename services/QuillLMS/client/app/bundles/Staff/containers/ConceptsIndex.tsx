import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import ConceptsTable from "../components/ConceptsTable";
import RadioGroup from "../../../../node_modules/antd/lib/radio/group";
import RadioButton from "../../../../node_modules/antd/lib/radio/radioButton";
import ConceptSearch from "../components/ConceptsSearch";
import ConceptManagerNav from "../components/ConceptManagerNav";
import ConceptBoxContainer from "./ConceptBoxContainer";
import Fuse from 'fuse.js'
const conceptsIndexQuery:string = `
  {
    concepts(childlessOnly: true) {
      id
      name
      createdAt
      visible
      parent {
        id
        name
        parent {
          id
          name
        }
      }
    }
  }
`
export interface Concept {
  id:string;
  uid?:string
  name:string;
  description?:string;
  createdAt?:number;
  parent?:Concept;
  visible?:boolean;
  siblings?:Array<Concept>;
  children?:Array<Concept>;
  replacementId?:string;
}
interface QueryResult {
  concepts: Array<Concept>
}


interface AppState {
  visible: boolean,
  searchValue: string,
  selectedConcept: { levelNumber?: Number, conceptID?: Number},
  fuse?: any
}


class ConceptsIndex extends React.Component<any, AppState> {
  constructor(props){
    super(props)

    this.state = {
      visible: true,
      searchValue: '',
      selectedConcept: {}
    }
    this.updateSearchValue = this.updateSearchValue.bind(this)
    this.selectConcept = this.selectConcept.bind(this)
  }

  filterConcepts(concepts:Array<Concept>, searchValue:string):Array<Concept>{
    if (searchValue == '') {return concepts};
    if (this.state.fuse) {
      return this.state.fuse.search(searchValue)
    } else {
      const options = {
        shouldSort: true,
        caseSensitive: false,
        tokenize: true,
        maxPatternLength: 32,
        minMatchCharLength: 3,
        keys: [
          "name",
          "parent.name",
          "parent.parent.name"
        ]
      };
      const fuse = new Fuse(concepts, options);
      this.setState({fuse});
      return concepts;
    }


    // const results:Array<any>|null = fs.get(searchValue);
    // const resultsNames:Array<string> = results ? results.map(result => result[1]) : [];

    // console.log("fuzzy = ", results, fs);
    // return concepts.filter((concept) => {
    //   return resultsNames.indexOf(getSearchableConceptName(concept)) != -1
    // })
  }

  updateSearchValue(searchValue:string):void {
    this.setState({searchValue})
  }

  selectConcept(conceptID, levelNumber) {
    this.setState({ selectedConcept: { conceptID, levelNumber }})
  }

  renderConceptBox() {
    const { conceptID, levelNumber } = this.state.selectedConcept
    if (conceptID && levelNumber) {
      console.log('HELLO')
      return <ConceptBoxContainer conceptID={conceptID} levelNumber={levelNumber}/>
    }
  }

  render() {
    let activeLink = 'concepts'
    if (window.location.href.includes('find_and_replace')) {
      activeLink = 'find_and_replace'
    } else if (window.location.href.includes('new')) {
      activeLink = "new"
    }
    return  (
      <div>
        <ConceptManagerNav />
        <Query
          query={gql(conceptsIndexQuery)}
        >
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;

            return (
              <div className="concepts-index">
              <div className="concepts-table-container">
                  <div className="concepts-index-tools">
                    <RadioGroup onChange={(e) => this.setState({visible: e.target.value})} defaultValue={this.state.visible}>
                      <RadioButton value={true}>Live</RadioButton>
                      <RadioButton value={false}>Archived</RadioButton>
                    </RadioGroup>
                    <ConceptSearch
                      concepts={this.filterConcepts(data.concepts, this.state.searchValue)}
                      searchValue={this.state.searchValue}
                      updateSearchValue={this.updateSearchValue}
                    />
                  </div>
                  <div>
                    <ConceptsTable
                      concepts={this.filterConcepts(data.concepts, this.state.searchValue)}
                      visible={this.state.visible}
                      selectConcept={this.selectConcept}
                    />
                  </div>
                </div>
                {this.renderConceptBox()}
              </div>
            )
          }}
        </Query>
      </div>

    )
  }

};

export default ConceptsIndex
