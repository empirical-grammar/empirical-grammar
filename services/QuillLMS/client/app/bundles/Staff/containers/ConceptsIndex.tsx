import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import ConceptsTable from "../components/ConceptsTable";
import ConceptLevels from "../components/ConceptLevels";
import ConceptSearch from "../components/ConceptsSearch";
import ConceptManagerNav from "../components/ConceptManagerNav";
import ConceptBoxContainer from "../components/ConceptBoxContainer";
import Fuse from 'fuse.js'
const conceptsIndexQuery:string = `
  {
    concepts {
      id
      name
      createdAt
      visible
      uid
      parent {
        id
        name
        uid
        parent {
          id
          name
          uid
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

interface ConceptsIndexState {
  visible: boolean,
  searchValue: string,
  showEditSuccessBanner: boolean,
  selectedConcept: { levelNumber?: Number, conceptID?: Number},
  fuse?: any
}


class ConceptsIndex extends React.Component<any, ConceptsIndexState> {
  constructor(props){
    super(props)

    this.state = {
      visible: true,
      searchValue: '',
      selectedConcept: {},
      showEditSuccessBanner: false
    }
    this.updateSearchValue = this.updateSearchValue.bind(this)
    this.selectConcept = this.selectConcept.bind(this)
    this.closeConceptBox = this.closeConceptBox.bind(this)
    this.finishEditingConcept = this.finishEditingConcept.bind(this)
    this.closeEditSuccessBanner = this.closeEditSuccessBanner.bind(this)
    this.setVisible = this.setVisible.bind(this)
  }

  finishEditingConcept(refetch) {
    this.setState({ showEditSuccessBanner: true, selectedConcept: {}, searchValue: '' }, () => refetch())
  }

  closeEditSuccessBanner() {
    this.setState({ showEditSuccessBanner: false })
  }

  setVisible(visible) {
    this.setState({ visible, selectedConcept: {}, searchValue: '' })
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
          "parent.parent.name",
          "uid",
          "parent.uid",
          "parent.parent.uid"
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

  closeConceptBox() {
    this.setState({ selectedConcept: {} })
  }

  renderConceptBox(refetch) {
    const { selectedConcept, visible } = this.state
    const { conceptID, levelNumber } = selectedConcept
    if (conceptID && (levelNumber || levelNumber === 0)) {
      return <ConceptBoxContainer
        conceptID={conceptID}
        levelNumber={levelNumber}
        visible={visible}
        finishEditingConcept={() => this.finishEditingConcept(refetch)}
        closeConceptBox={this.closeConceptBox}
      />
    }
  }

  renderEditSuccessBanner() {
    if (this.state.showEditSuccessBanner) {
      return <div className="success-banner"><span>You saved a concept.</span><i className="fa fa-close" onClick={this.closeEditSuccessBanner}/></div>
    }
  }

  renderLiveAndArchivedTabs() {
    const { visible } = this.state
    return <div className="concepts-index-tools">
      <p onClick={() => this.setVisible(true)} className={visible ? 'active' : ''}>Live</p>
      <p onClick={() => this.setVisible(false)} className={visible ? '' : 'active'}>Archived</p>
    </div>
  }

  renderConcepts(data) {
    if (this.state.visible) {
      return <ConceptsTable
        concepts={this.filterConcepts(data.concepts, this.state.searchValue)}
        visible={this.state.visible}
        selectConcept={this.selectConcept}
      />
    } else {
      return <ConceptLevels
        concepts={this.filterConcepts(data.concepts, this.state.searchValue).filter(c => !c.visible)}
        selectConcept={this.selectConcept}
      />
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
        {this.renderEditSuccessBanner()}
        <Query
          query={gql(conceptsIndexQuery)}
          notifyOnNetworkStatusChange
        >
          {({ loading, error, data, refetch, networkStatus }) => {
            if (networkStatus === 4) return <p>Refetching!</p>;
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;

            return (
              <div className="concepts-index">
                <div className="concepts-index-top">
                  <ConceptSearch
                    concepts={this.filterConcepts(data.concepts, this.state.searchValue)}
                    searchValue={this.state.searchValue}
                    updateSearchValue={this.updateSearchValue}
                  />
                  {this.renderLiveAndArchivedTabs()}
                </div>
                <div className="concepts-index-bottom">
                  <div className="concepts-table-container">
                    <div>
                      {this.renderConcepts(data)}
                    </div>
                </div>
                {this.renderConceptBox(refetch)}
              </div>
            </div>)
          }}
        </Query>
      </div>

    )
  }

};

export default ConceptsIndex
