import * as React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import client from '../../../modules/apollo';
import ConceptBox from "./ConceptBox";
import ArchivedConceptBox from "./ArchivedConceptBox";
import { Concept } from '../interfaces/interfaces'

function conceptQuery(id){
  return `
  {
    concept(id: ${id}) {
      id
      uid
      name
      description
      visible
      updatedAt
      replacement {
        name
      }
      parent {
        id
        name
        visible
        updatedAt
        parent {
          id
          name
          visible
          updatedAt
        }
      }
    }
  }
`
}

interface QueryResult {
  id:string;
  name:string;
  parent?:Concept;
  children: Array<Concept>;
  siblings: Array<Concept>;
}

interface ConceptBoxContainerProps {
  conceptID: Number;
  visible: Boolean;
  levelNumber: Number;
  finishEditingConcept: Function;
  closeConceptBox: Function;
}

class ConceptBoxContainer extends React.Component<any, ConceptBoxContainerProps> {
  constructor(props){
    super(props)
  }

  render() {
    const { conceptID, visible, levelNumber, finishEditingConcept, closeConceptBox } = this.props
    return  (
      <Query
        query={gql(conceptQuery(conceptID))}
      >
        {({ loading, error, data }) => {
          console.log('error', error)
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error :(</p>;
          const concept:QueryResult = data.concept;
          if (visible) {
            return (
              <ConceptBox
                concept={concept}
                levelNumber={levelNumber}
                finishEditingConcept={finishEditingConcept}
                closeConceptBox={closeConceptBox}
              />
            )
          } else {
            return (
              <ArchivedConceptBox
                concept={concept}
                levelNumber={levelNumber}
                finishEditingConcept={finishEditingConcept}
                closeConceptBox={closeConceptBox}
              />
            )
          }
        }}
      </Query>
    )
  }

};

export default ConceptBoxContainer
