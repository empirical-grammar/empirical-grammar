import React from 'react'
export default React.createClass({

  render: function(){
    return(
      <div className='premium-testimonial text-center'>
        <img alt="daniel_image" className='img-circle' src={`${process.env.CDN_URL}/images/shared/daniel_90.png`} />
        <p>"I’ve seen tremendous improvement in the proficiency of my students and the quality of their writing."</p>
        <p className="quote-author"><span>Daniel Scibienski</span>, 8th Grade ELA & ELL Educator</p>
      </div>
    );
}
});
