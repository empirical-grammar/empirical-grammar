import React from 'react'
import AssignmentTypeMini from './assignment_type_mini'
import LaunchingSoonMini from './launching_soon_mini'

export default React.createClass({

  minis: function(){
    let minis =
      [
        <a href='/diagnostic/413/stage/1'
            key={1}>
          <AssignmentTypeMini
            title={'Sentence Structure Diagnostic'}
            img={'/images/diagnostic_icon.svg'}
            bodyText={'Find your students’ writing abilities with a 22 question diagnostic.'}
            directions={'use intermittently'}
            quantity={1}
            unit={'Diagnostic'}
            timeDuration={'~20 Min.'}
            />
          </a>,
          <a key={2} href='/diagnostic/447/stage/2'>
            <AssignmentTypeMini
              title={'ELL Diagnostic'}
              img={'/images/ell_diagnostic_icon.svg'}
              bodyText={'Find your students’ writing abilities with a 22 question diagnostic for language learners.'}
              directions={'use continuously'}
              quantity={1}
              unit={'Diagnostic'}
              timeDuration={'~25 Min.'}
            />
          </a>,
          <a key={3}>
            <LaunchingSoonMini />
          </a>
        ]
      return minis
},

render: function(){
  return(
    <div id='assign-a-diagnostic-page' className='text-center'>
      <h1>Choose which type of diagnostic you'd like to use:</h1>
      <div className='minis'>{this.minis()}</div>
    </div>
  )
}
})
