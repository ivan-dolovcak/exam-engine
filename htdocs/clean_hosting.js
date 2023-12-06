// Remove the advertisement and tracking elements of the hosting service.

try {
    document.querySelector(`body > div:last-of-type`).remove();
    document.querySelector(`body > script:last-of-type`).remove();
} catch (error) { 
    if (error instanceof TypeError)
        console.log("NOTE: hosting advertisement/tracking elements not \
found, you're probably viewing this locally or on a different server.");

    else throw (error);
}
