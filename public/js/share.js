// public/js/share.js
document.addEventListener('DOMContentLoaded', function() {
    // Get the current page URL
    const currentURL = window.location.href;
  
    // Get share button elements
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareEmail = document.getElementById('shareEmail');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
  
    // Set the href attributes for sharing via WhatsApp, Facebook, and Email
    if (shareWhatsApp) {
      shareWhatsApp.href = 'https://wa.me/?text=' + encodeURIComponent(currentURL);
    }
    if (shareFacebook) {
      shareFacebook.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(currentURL);
    }
    if (shareEmail) {
      shareEmail.href =
        'mailto:?subject=Check out this job&body=I found this job and thought you might be interested: ' + encodeURIComponent(currentURL);
    }
  
    // Copy Link functionality
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(currentURL).then(function() {
          copyLinkBtn.innerHTML = '<img src="/images/copy.png" alt="Copy Link" class="share-icon"> <span>Copied!</span>';
          setTimeout(() => {
            copyLinkBtn.innerHTML = '<img src="/images/copy.png" alt="Copy Link" class="share-icon"> <span>Copy Link</span>';
          }, 2000);
        }).catch(function(err) {
          console.error('Could not copy text: ', err);
        });
      });
    }
  });
  